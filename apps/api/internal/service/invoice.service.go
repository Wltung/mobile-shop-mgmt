package service

import (
	"api/internal/model"
	"api/internal/repository"
	"fmt"
	"strconv"
	"time"
)

type InvoiceService struct {
	Repo         *repository.InvoiceRepo
	PhoneService *PhoneService
}

func NewInvoiceService(repo *repository.InvoiceRepo, phoneService *PhoneService) *InvoiceService {
	return &InvoiceService{
		Repo:         repo,
		PhoneService: phoneService,
	}
}

func (s *InvoiceService) generateInvoiceCode(invType string, tenantID int) (string, error) {
	prefix := "HD"
	switch invType {
	case "IMPORT":
		prefix = "HDN"
	case "SALE":
		prefix = "HDB"
	case "REPAIR":
		prefix = "HDS"
	default:
		prefix = "HDK"
	}

	now := time.Now()
	dateStr := now.Format("02012006")

	count, err := s.Repo.GetCountTodayByType(invType, tenantID)
	if err != nil {
		return "", err
	}

	sequence := count + 1
	code := fmt.Sprintf("%s-%s-%03d", prefix, dateStr, sequence)
	return code, nil
}

func (s *InvoiceService) CreateInvoice(input model.CreateInvoiceInput, userID int, tenantID int) (int, error) {
	var totalAmount int64 = 0
	var items []model.InvoiceItem

	for i, itemInput := range input.Items {
		if itemInput.ItemType == model.ItemTypePhone && itemInput.PhoneID == nil {
			return 0, fmt.Errorf("mục thứ %d: điện thoại bắt buộc phải chọn máy (PhoneID)", i+1)
		}

		amount := int64(itemInput.Quantity) * itemInput.UnitPrice
		totalAmount += amount

		items = append(items, model.InvoiceItem{
			ItemType:       itemInput.ItemType,
			PhoneID:        itemInput.PhoneID,
			Description:    itemInput.Description,
			Quantity:       itemInput.Quantity,
			UnitPrice:      itemInput.UnitPrice,
			Amount:         amount,
			WarrantyMonths: itemInput.WarrantyMonths,
			WarrantyDays:   itemInput.WarrantyDays,
		})
	}

	finalTotal := totalAmount - input.Discount
	if finalTotal < 0 {
		finalTotal = 0
	}

	status := input.Status
	if status == "" {
		status = model.InvoiceStatusPaid
	}

	code, err := s.generateInvoiceCode(input.Type, tenantID)
	if err != nil {
		return 0, err
	}

	invoice := model.Invoice{
		TenantID:         tenantID,
		InvoiceCode:      code,
		Type:             input.Type,
		Status:           status,
		PaymentMethod:    input.PaymentMethod,
		CustomerName:     &input.CustomerName,
		CustomerPhone:    &input.CustomerPhone,
		CustomerIDNumber: &input.CustomerIDNumber,
		TotalAmount:      finalTotal,
		Discount:         input.Discount,
		CreatedBy:        userID,
		CreatedAt:        time.Now(),
		Note:             &input.Note,
	}

	invoiceID, err := s.Repo.Create(invoice, items)
	if err != nil {
		return 0, err
	}

	if input.Type == model.InvoiceTypeSale {
		for _, item := range items {
			if item.ItemType == model.ItemTypePhone && item.PhoneID != nil {
				s.PhoneService.MarkPhoneAsSold(*item.PhoneID, item.UnitPrice, invoice.CreatedAt, tenantID)
			}
		}
	}

	return invoiceID, nil
}

func (s *InvoiceService) GetInvoiceDetail(id int, tenantID int) (*model.Invoice, error) {
	return s.Repo.GetByID(id, tenantID)
}

func (s *InvoiceService) UpdateStatus(id int, status string, tenantID int) error {
	return s.Repo.UpdateStatus(id, status, tenantID)
}

func (s *InvoiceService) UpdateInvoice(id int, input model.UpdateInvoiceInput, tenantID int) error {

	oldInvoice, err := s.GetInvoiceDetail(id, tenantID)
	if err != nil {
		return err
	}
	var oldPhoneID *int
	var oldPrice int64 = oldInvoice.TotalAmount
	for _, item := range oldInvoice.Items {
		if item.ItemType == "PHONE" && item.PhoneID != nil {
			oldPhoneID = item.PhoneID
			break
		}
	}

	err = s.Repo.Update(id, input, tenantID)
	if err != nil {
		return err
	}

	if oldInvoice.Type == model.InvoiceTypeSale {
		if input.PhoneID != nil && oldPhoneID != nil && *input.PhoneID != *oldPhoneID {
			s.PhoneService.RevertPhoneToInStock(*oldPhoneID, tenantID)
			salePrice := oldPrice
			if input.ActualSalePrice != "" {
				parsedPrice, _ := strconv.ParseInt(input.ActualSalePrice, 10, 64)
				salePrice = parsedPrice
			}
			s.PhoneService.MarkPhoneAsSold(*input.PhoneID, salePrice, time.Now(), tenantID)
		} else if input.ActualSalePrice != "" && oldPhoneID != nil {
			parsedPrice, _ := strconv.ParseInt(input.ActualSalePrice, 10, 64)
			s.PhoneService.MarkPhoneAsSold(*oldPhoneID, parsedPrice, time.Now(), tenantID)
		}
	}

	return nil
}

func (s *InvoiceService) GetInvoices(filter model.InvoiceFilter, tenantID int) ([]model.Invoice, int, model.InvoiceStats, error) {
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 {
		filter.Limit = 10
	}

	items, total, err := s.Repo.GetAll(filter, tenantID)
	if err != nil {
		return nil, 0, model.InvoiceStats{}, err
	}

	count, revenue, _ := s.Repo.GetDailyStats(tenantID)
	stats := model.InvoiceStats{TotalCount: count, TotalRevenue: revenue}

	return items, total, stats, nil
}

func (s *InvoiceService) CancelOrDeleteInvoice(id int, tenantID int) error {
	inv, err := s.GetInvoiceDetail(id, tenantID) // ĐÃ FIX
	if err != nil {
		return err
	}
	if inv == nil {
		return fmt.Errorf("không tìm thấy hoá đơn")
	}

	if inv.Type == model.InvoiceTypeImport {
		for _, item := range inv.Items {
			if item.ItemType == model.ItemTypePhone && item.PhoneID != nil {
				phone, err := s.PhoneService.GetPhoneDetail(*item.PhoneID, tenantID)
				if err != nil {
					return fmt.Errorf("lỗi khi kiểm tra dữ liệu máy: %v", err)
				}

				if phone != nil && (phone.Status == "SOLD" || phone.Status == "REPAIRING") {
					trangThai := "Đã bán (SOLD)"
					action := "huỷ hoá đơn bán"
					if phone.Status == "REPAIRING" {
						trangThai = "Đang sửa chữa (REPAIRING)"
						action = "huỷ phiếu sửa chữa"
					}

					return fmt.Errorf("không thể huỷ hoá đơn vì máy '%s' đang ở trạng thái %s. Vui lòng %s trước", phone.ModelName, trangThai, action)
				}
			}
		}
	}

	if inv.Status == model.InvoiceStatusDraft {
		switch inv.Type {
		case model.InvoiceTypeImport:
			for _, item := range inv.Items {
				if item.ItemType == model.ItemTypePhone && item.PhoneID != nil {
					_ = s.PhoneService.HardDeletePhone(*item.PhoneID, tenantID)
				}
			}
		case model.InvoiceTypeSale:
			for _, item := range inv.Items {
				if item.ItemType == model.ItemTypePhone && item.PhoneID != nil {
					s.PhoneService.RevertPhoneToInStock(*item.PhoneID, tenantID)
				}
			}
		}
		return s.Repo.HardDelete(id, tenantID) // ĐÃ FIX
	}

	if inv.Status == model.InvoiceStatusPaid {
		err := s.Repo.UpdateStatus(id, model.InvoiceStatusCancelled, tenantID) // ĐÃ FIX
		if err != nil {
			return err
		}

		switch inv.Type {
		case model.InvoiceTypeSale:
			for _, item := range inv.Items {
				if item.ItemType == model.ItemTypePhone && item.PhoneID != nil {
					s.PhoneService.RevertPhoneToInStock(*item.PhoneID, tenantID)
				}
			}
		case model.InvoiceTypeImport:
			for _, item := range inv.Items {
				if item.ItemType == model.ItemTypePhone && item.PhoneID != nil {
					_ = s.PhoneService.SoftDeletePhoneBypass(*item.PhoneID, tenantID)
				}
			}
		case model.InvoiceTypeRepair:
			_ = s.Repo.SoftDeleteRepairByInvoice(id, tenantID) // ĐÃ FIX
		}
		return nil
	}

	if inv.Status == model.InvoiceStatusCancelled {
		return fmt.Errorf("hoá đơn này đã bị huỷ từ trước")
	}

	return fmt.Errorf("trạng thái hoá đơn không hợp lệ")
}
