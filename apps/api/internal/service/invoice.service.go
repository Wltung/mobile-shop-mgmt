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
	PhoneService *PhoneService // Đã xoá CustomerService
}

func NewInvoiceService(repo *repository.InvoiceRepo, phoneService *PhoneService) *InvoiceService {
	return &InvoiceService{
		Repo:         repo,
		PhoneService: phoneService,
	}
}

func (s *InvoiceService) generateInvoiceCode(invType string) (string, error) {
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

	count, err := s.Repo.GetCountTodayByType(invType)
	if err != nil {
		return "", err
	}

	sequence := count + 1
	code := fmt.Sprintf("%s-%s-%03d", prefix, dateStr, sequence)
	return code, nil
}

func (s *InvoiceService) CreateInvoice(input model.CreateInvoiceInput, userID int) (int, error) {
	// 1. TÍNH TOÁN ITEMS & TỔNG TIỀN
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
		finalTotal = 0 // Tránh trường hợp giảm giá lố tay thành số âm
	}

	// 2. TẠO HEADER HOÁ ĐƠN
	status := input.Status
	if status == "" {
		status = model.InvoiceStatusPaid
	}

	code, err := s.generateInvoiceCode(input.Type)
	if err != nil {
		return 0, err
	}

	invoice := model.Invoice{
		InvoiceCode:      code,
		Type:             input.Type,
		Status:           status,
		PaymentMethod:    input.PaymentMethod,
		CustomerName:     &input.CustomerName,
		CustomerPhone:    &input.CustomerPhone,
		CustomerIDNumber: &input.CustomerIDNumber,

		TotalAmount: finalTotal,
		Discount:    input.Discount,

		CreatedBy: userID,
		CreatedAt: time.Now(),
		Note:      &input.Note,
	}

	// 3. LƯU VÀO DB
	invoiceID, err := s.Repo.Create(invoice, items)
	if err != nil {
		return 0, err
	}

	// 4. CẬP NHẬT TRẠNG THÁI MÁY
	if input.Type == model.InvoiceTypeSale {
		for _, item := range items {
			if item.ItemType == model.ItemTypePhone && item.PhoneID != nil {
				s.PhoneService.MarkPhoneAsSold(*item.PhoneID, item.UnitPrice, invoice.CreatedAt)
			}
		}
	}

	return invoiceID, nil
}

func (s *InvoiceService) GetInvoiceDetail(id int) (*model.Invoice, error) {
	return s.Repo.GetByID(id)
}

func (s *InvoiceService) UpdateStatus(id int, status string) error {
	return s.Repo.UpdateStatus(id, status)
}

func (s *InvoiceService) UpdateInvoice(id int, input model.UpdateInvoiceInput, userID int) error {
	// 1. LẤY HOÁ ĐƠN CŨ ĐỂ KIỂM TRA MÁY BỊ ĐỔI
	oldInvoice, err := s.GetInvoiceDetail(id)
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

	// 2. GỌI REPO UPDATE HOÁ ĐƠN TRỰC TIẾP
	err = s.Repo.Update(id, input)
	if err != nil {
		return err
	}

	// 3. ĐIỀU PHỐI ĐỔI TRẠNG THÁI MÁY (Chỉ áp dụng cho hoá đơn BÁN)
	if oldInvoice.Type == model.InvoiceTypeSale {
		if input.PhoneID != nil && oldPhoneID != nil && *input.PhoneID != *oldPhoneID {
			// A. Có đổi máy: Trả máy cũ về kho
			s.PhoneService.RevertPhoneToInStock(*oldPhoneID)

			// B. Đánh dấu máy mới thành Đã bán
			salePrice := oldPrice
			if input.ActualSalePrice != "" {
				parsedPrice, _ := strconv.ParseInt(input.ActualSalePrice, 10, 64)
				salePrice = parsedPrice
			}
			s.PhoneService.MarkPhoneAsSold(*input.PhoneID, salePrice, time.Now())

		} else if input.ActualSalePrice != "" && oldPhoneID != nil {
			// C. Không đổi máy nhưng có đổi Giá bán
			parsedPrice, _ := strconv.ParseInt(input.ActualSalePrice, 10, 64)
			s.PhoneService.MarkPhoneAsSold(*oldPhoneID, parsedPrice, time.Now())
		}
	}

	return nil
}

func (s *InvoiceService) GetInvoices(filter model.InvoiceFilter) ([]model.Invoice, int, model.InvoiceStats, error) {
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 {
		filter.Limit = 10
	}

	items, total, err := s.Repo.GetAll(filter)
	if err != nil {
		return nil, 0, model.InvoiceStats{}, err
	}

	count, revenue, _ := s.Repo.GetDailyStats()
	stats := model.InvoiceStats{TotalCount: count, TotalRevenue: revenue}

	return items, total, stats, nil
}
