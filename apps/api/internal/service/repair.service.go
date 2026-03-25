package service

import (
	"api/internal/model"
	"api/internal/repository"
	"encoding/json"
	"errors"
	"fmt"
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

func (s *RepairService) CreateRepairTicket(input model.CreateRepairInput, userID int) (int, error) {
	// 1. CHUẨN BỊ OBJECT DESCRIPTION JSON
	descObj := model.RepairDescription{
		Fault:            input.Fault,
		Accessories:      input.Accessories,
		TechnicalNote:    input.TechnicalNote,
		Parts:            input.Parts,
		Discount:         input.Discount,
		HasLaborWarranty: input.HasLaborWarranty,
	}

	// Logic Auto Hẹn trả
	if input.PromisedReturnDate != nil && *input.PromisedReturnDate != "" {
		descObj.IsPromisedReturn = true
		descObj.PromisedReturnDate = input.PromisedReturnDate
	}

	// Logic Tự map máy kho
	if input.RepairCategory == "SHOP_DEVICE_REPAIR" && input.PhoneID != nil {
		name, imei, color, err := s.Repo.GetPhoneBasicInfo(*input.PhoneID)
		if err == nil {
			descObj.DeviceName = name
			descObj.IMEI = imei
			descObj.Color = color
		}
	} else {
		descObj.DeviceName = input.DeviceName
		descObj.IMEI = input.IMEI
		descObj.Color = input.Color
	}

	descBytes, _ := json.Marshal(descObj)
	descStr := string(descBytes)

	// 2. MAP VÀO MODEL REPAIR
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

	repair := model.Repair{
		PhoneID:        input.PhoneID,
		CustomerName:   cName,
		CustomerPhone:  cPhone,
		RepairCategory: input.RepairCategory,
		Description:    &descStr,
		PartCost:       input.PartCost,
		RepairPrice:    input.RepairPrice,
		DevicePassword: passPtr,
	}

	repairID, err := s.Repo.Create(repair)
	if err != nil {
		return 0, err
	}

	if input.RepairCategory == "SHOP_DEVICE_REPAIR" && input.PhoneID != nil {
		s.PhoneService.UpdatePhoneStatus(*input.PhoneID, "REPAIRING")
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

	var descObj model.RepairDescription
	if existingRepair.Description != nil {
		json.Unmarshal([]byte(*existingRepair.Description), &descObj)
	}

	isDescUpdated := false
	if input.Fault != nil {
		descObj.Fault = *input.Fault
		isDescUpdated = true
	}
	if input.Accessories != nil {
		descObj.Accessories = *input.Accessories
		isDescUpdated = true
	}
	if input.TechnicalNote != nil {
		descObj.TechnicalNote = *input.TechnicalNote
		isDescUpdated = true
	}

	// Cập nhật ngày hẹn trả (Có ngày thì bật true, rỗng thì tắt false)
	if input.PromisedReturnDate != nil {
		if *input.PromisedReturnDate != "" {
			descObj.IsPromisedReturn = true
			descObj.PromisedReturnDate = input.PromisedReturnDate
		} else {
			descObj.IsPromisedReturn = false
			descObj.PromisedReturnDate = nil
		}
		isDescUpdated = true
	}

	if input.Parts != nil {
		descObj.Parts = input.Parts
		isDescUpdated = true
	}
	if input.Discount != nil {
		descObj.Discount = *input.Discount
		isDescUpdated = true
	}
	if input.HasLaborWarranty != nil {
		descObj.HasLaborWarranty = *input.HasLaborWarranty
		isDescUpdated = true
	}

	if isDescUpdated {
		b, _ := json.Marshal(descObj)
		str := string(b)
		input.Description = &str
	}

	return s.Repo.Update(id, input)
}

func (s *RepairService) GetRepairDetail(id int) (*model.RepairListItem, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if item != nil && item.Description != nil {
		var descObj model.RepairDescription
		if err := json.Unmarshal([]byte(*item.Description), &descObj); err == nil {
			item.DescriptionJSON = &descObj
			item.DeviceName = descObj.DeviceName
		}
	}
	return item, nil
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
		if items[i].Description != nil {
			var descObj model.RepairDescription
			if err := json.Unmarshal([]byte(*items[i].Description), &descObj); err == nil {
				items[i].DescriptionJSON = &descObj
				if descObj.DeviceName != "" {
					items[i].DeviceName = descObj.DeviceName
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
	repair, err := s.GetRepairDetail(id)
	if err != nil {
		return 0, err
	}
	if repair == nil {
		return 0, errors.New("không tìm thấy phiếu sửa chữa")
	}
	if repair.InvoiceID != nil {
		return *repair.InvoiceID, nil
	}

	// ==========================================
	// NHÁNH 1: SỬA MÁY KHO (Không tạo hoá đơn, cộng dồn giá vốn)
	// ==========================================
	if repair.RepairCategory == "SHOP_DEVICE_REPAIR" {

		// 1. Mở khoá trả máy về IN_STOCK (Không cộng thêm purchase_price nữa)
		if repair.PhoneID != nil {
			errStatus := s.PhoneService.UpdatePhoneStatus(*repair.PhoneID, "IN_STOCK")
			if errStatus != nil {
				return 0, fmt.Errorf("lỗi khi trả máy về IN_STOCK: %v", errStatus)
			}
		}

		// 2. Chốt phiếu sửa
		statusCompleted := "COMPLETED"
		err = s.Repo.Update(id, model.UpdateRepairInput{
			Status: &statusCompleted,
		})
		if err != nil {
			return 0, fmt.Errorf("lỗi cập nhật trạng thái phiếu: %v", err)
		}

		return 0, nil // Trả về 0 vì KHÔNG CÓ hoá đơn nào được tạo ra
	}

	// ==========================================
	// NHÁNH 2: SỬA MÁY KHÁCH (Tạo hoá đơn thu tiền)
	// ==========================================
	deviceName := "Thiết bị sửa chữa"
	if repair.DeviceName != "" {
		deviceName = repair.DeviceName
	}

	var items []model.CreateItemInput
	var discountAmount int64 = 0
	hasLaborWarranty := false

	if repair.DescriptionJSON != nil {
		for _, p := range repair.DescriptionJSON.Parts {
			items = append(items, model.CreateItemInput{
				ItemType:       model.ItemTypePart,
				PhoneID:        repair.PhoneID,
				Description:    p.Name,
				Quantity:       1,
				UnitPrice:      p.Price,
				WarrantyMonths: p.Warranty,
			})
		}
		discountAmount = repair.DescriptionJSON.Discount
		hasLaborWarranty = repair.DescriptionJSON.HasLaborWarranty
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

	if len(items) == 0 {
		return 0, errors.New("phiếu chưa có chi phí (Linh kiện/Tiền công) nên không thể chốt")
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
		Discount:      discountAmount,
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
		return 0, fmt.Errorf("đã xuất HĐ nhưng lỗi cập nhật trạng thái phiếu: %v", err)
	}

	return invoiceID, nil
}
