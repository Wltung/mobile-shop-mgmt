package service

import (
	"api/internal/model"
	"api/internal/repository"
	"errors"
	"fmt"
	"strconv"
	"strings"
)

type RepairService struct {
	Repo           *repository.RepairRepo
	InvoiceService *InvoiceService
	PhoneService   *PhoneService
}

func NewRepairService(repo *repository.RepairRepo, invService *InvoiceService, phoneService *PhoneService) *RepairService {
	return &RepairService{
		Repo:           repo,
		InvoiceService: invService,
		PhoneService:   phoneService,
	}
}

// CreateRepairTicket: Tạo phiếu nhận máy
func (s *RepairService) CreateRepairTicket(input model.CreateRepairInput, userID int) (int, error) {
	// 1. CHUẨN BỊ MÔ TẢ (Xử lý máy vãng lai)
	description := input.Description
	if input.PhoneID == nil && input.DeviceName != "" {
		description = "[Máy ngoài: " + input.DeviceName + "] " + description
	}

	var descPtr *string
	if description != "" {
		descPtr = &description
	}
	var passPtr *string
	if input.DevicePassword != "" {
		passPtr = &input.DevicePassword
	}

	var cName *string
	if input.CustomerName != "" {
		cName = &input.CustomerName
	}
	var cPhone *string
	if input.CustomerPhone != "" {
		cPhone = &input.CustomerPhone
	}

	// 2. MAP VÀO MODEL REPAIR
	repair := model.Repair{
		PhoneID:        input.PhoneID,
		CustomerName:   cName,
		CustomerPhone:  cPhone,
		RepairCategory: input.RepairCategory,
		Description:    descPtr,
		PartCost:       input.PartCost,
		RepairPrice:    input.RepairPrice,
		DevicePassword: passPtr,
	}

	// 3. LƯU VÀO DB
	repairID, err := s.Repo.Create(repair)
	if err != nil {
		return 0, err
	}

	// 4. LOGIC KHOÁ MÁY KHO: Đổi trạng thái thành REPAIRING
	if input.RepairCategory == "SHOP_DEVICE_REPAIR" && input.PhoneID != nil {
		errStatus := s.PhoneService.UpdatePhoneStatus(*input.PhoneID, "REPAIRING")
		if errStatus != nil {
			fmt.Printf("Lỗi khi khoá máy %d sang REPAIRING: %v\n", *input.PhoneID, errStatus)
		}
	}

	return repairID, nil
}

func (s *RepairService) UpdateRepairTicket(id int, input model.UpdateRepairInput) error {
	existingRepair, err := s.Repo.GetByID(id)
	if err != nil {
		return err
	}
	if existingRepair == nil {
		return errors.New("phiếu sửa chữa không tìm thấy")
	}
	return s.Repo.Update(id, input)
}

func (s *RepairService) GetRepairDetail(id int) (*model.RepairListItem, error) {
	return s.Repo.GetByID(id)
}

func (s *RepairService) GetRepairs(filter model.RepairFilter) ([]model.RepairListItem, int, map[string]int, error) {
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 {
		filter.Limit = 10
	}

	items, total, err := s.Repo.GetAll(filter)
	if err != nil {
		return nil, 0, nil, err
	}

	for i := range items {
		items[i].DeviceName = "---"

		if items[i].PhoneModel != nil {
			items[i].DeviceName = *items[i].PhoneModel
		} else if items[i].Description != nil {
			desc := *items[i].Description
			if strings.HasPrefix(desc, "[Máy ngoài: ") {
				endIdx := strings.Index(desc, "]")
				if endIdx > -1 {
					items[i].DeviceName = desc[14:endIdx]
				}
			}
		}
	}

	repairingCount, completedCount, _ := s.Repo.GetStats()
	stats := map[string]int{
		"repairingCount":      repairingCount,
		"completedTodayCount": completedCount,
	}

	return items, total, stats, nil
}

func (s *RepairService) CompleteRepair(id int, userID int) (int, error) {
	repair, err := s.Repo.GetByID(id)
	if err != nil {
		return 0, err
	}
	if repair == nil {
		return 0, errors.New("không tìm thấy phiếu sửa chữa")
	}

	if repair.InvoiceID != nil {
		return *repair.InvoiceID, nil
	}

	deviceName := "Thiết bị sửa chữa"
	if repair.PhoneModel != nil {
		deviceName = *repair.PhoneModel
	}

	var items []model.CreateItemInput
	hasParsedParts := false
	var discountAmount int64 = 0
	hasLaborWarranty := false

	if repair.Description != nil {
		lines := strings.Split(*repair.Description, "\n")
		for _, line := range lines {
			line = strings.TrimSpace(line)

			if repair.PhoneModel == nil && strings.HasPrefix(line, "[Máy ngoài: ") {
				endIdx := strings.Index(line, "]")
				if endIdx > -1 {
					nameStr := strings.TrimPrefix(line[:endIdx], "[Máy ngoài: ")
					deviceName = strings.TrimSpace(nameStr)
				}
			}

			if strings.HasPrefix(line, "- Linh kiện: ") {
				content := strings.TrimPrefix(line, "- Linh kiện: ")
				parts := strings.Split(content, "|")

				if len(parts) >= 3 {
					name := strings.TrimSpace(parts[0])
					priceStr := strings.TrimSpace(parts[1])
					warrantyStr := strings.TrimSpace(parts[2])

					price, _ := strconv.ParseInt(priceStr, 10, 64)
					warranty, _ := strconv.Atoi(warrantyStr)

					items = append(items, model.CreateItemInput{
						ItemType:       model.ItemTypePart,
						PhoneID:        repair.PhoneID,
						Description:    name,
						Quantity:       1,
						UnitPrice:      price,
						WarrantyMonths: warranty,
					})
					hasParsedParts = true
				}
			}
		}
	}

	if !hasParsedParts && repair.PartCost != nil && *repair.PartCost > 0 {
		items = append(items, model.CreateItemInput{
			ItemType:    model.ItemTypePart,
			PhoneID:     repair.PhoneID,
			Description: "Linh kiện thay thế: " + deviceName,
			Quantity:    1,
			UnitPrice:   *repair.PartCost,
		})
	}

	if repair.RepairPrice != nil && *repair.RepairPrice > 0 {
		laborDesc := "Công sửa chữa: " + deviceName
		if hasLaborWarranty {
			laborDesc += " (Bảo hành 7 ngày)"
		}

		items = append(items, model.CreateItemInput{
			ItemType:       model.ItemTypeService,
			PhoneID:        repair.PhoneID,
			Description:    laborDesc,
			Quantity:       1,
			UnitPrice:      *repair.RepairPrice,
			WarrantyMonths: 0,
		})
	}

	if discountAmount > 0 {
		items = append(items, model.CreateItemInput{
			ItemType:       model.ItemTypeService,
			PhoneID:        repair.PhoneID,
			Description:    "Giảm giá dịch vụ",
			Quantity:       1,
			UnitPrice:      -discountAmount,
			WarrantyMonths: 0,
		})
	}

	if len(items) == 0 {
		return 0, errors.New("phiếu sửa chữa chưa có chi phí (Linh kiện/Tiền công) nên không thể xuất hoá đơn")
	}

	cName := "Khách vãng lai"
	if repair.CustomerName != nil {
		cName = *repair.CustomerName
	}
	cPhone := ""
	if repair.CustomerPhone != nil {
		cPhone = *repair.CustomerPhone
	}

	invoiceInput := model.CreateInvoiceInput{
		Type:          model.InvoiceTypeRepair,
		Status:        model.InvoiceStatusPaid,
		PaymentMethod: "CASH",
		CustomerName:  cName,
		CustomerPhone: cPhone,
		Note:          fmt.Sprintf("Hoá đơn sửa chữa theo Phiếu #REP-%06d", repair.ID),
		Items:         items,
	}

	invoiceID, err := s.InvoiceService.CreateInvoice(invoiceInput, userID)
	if err != nil {
		return 0, fmt.Errorf("lỗi khi tạo hoá đơn: %v", err)
	}

	statusCompleted := "COMPLETED"
	err = s.Repo.Update(id, model.UpdateRepairInput{
		Status:    &statusCompleted,
		InvoiceID: &invoiceID,
	})
	if err != nil {
		return 0, fmt.Errorf("đã tạo hoá đơn #%d nhưng lỗi cập nhật trạng thái phiếu sửa: %v", invoiceID, err)
	}

	return invoiceID, nil
}
