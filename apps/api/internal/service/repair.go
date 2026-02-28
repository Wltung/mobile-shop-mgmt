package service

import (
	"api/internal/model"
	"api/internal/repository"
	"errors"
	"fmt"
	"strings"
)

type RepairService struct {
	Repo            *repository.RepairRepo
	CustomerService *CustomerService // Dùng chung CustomerService để định danh
	InvoiceService  *InvoiceService
}

func NewRepairService(repo *repository.RepairRepo, custService *CustomerService, invService *InvoiceService) *RepairService {
	return &RepairService{
		Repo:            repo,
		CustomerService: custService,
		InvoiceService:  invService,
	}
}

// CreateRepairTicket: Tạo phiếu nhận máy
func (s *RepairService) CreateRepairTicket(input model.CreateRepairInput, userID int) (int, error) {
	// 1. XỬ LÝ ĐỊNH DANH KHÁCH HÀNG (Qua CustomerService)
	custInput := model.CustomerIdentityInput{
		Name:     input.CustomerName,
		Phone:    input.CustomerPhone,
		IDNumber: input.CustomerIDNumber,
	}

	// Gọi CustomerService với context "REPAIR"
	// Khách đem máy tới sửa bắt buộc phải có thông tin để còn gọi ra nhận máy
	custIDPtr, err := s.CustomerService.HandleCustomerForInvoice("REPAIR", custInput, userID)
	if err != nil {
		return 0, err
	}

	// 2. CHUẨN BỊ MÔ TẢ (Xử lý máy vãng lai)
	description := input.Description
	// Nếu máy là khách mang từ ngoài vào (PhoneID = nil) mà có nhập DeviceName
	// Ta sẽ nối DeviceName vào Description để thợ biết đang sửa máy gì.
	if input.PhoneID == nil && input.DeviceName != "" {
		description = "[Máy ngoài: " + input.DeviceName + "] " + description
	}

	// Helper chuyển string rỗng sang nil pointer cho DB
	var descPtr *string
	if description != "" {
		descPtr = &description
	}
	var passPtr *string
	if input.DevicePassword != "" {
		passPtr = &input.DevicePassword
	}

	// 3. MAP VÀO MODEL REPAIR
	repair := model.Repair{
		PhoneID:        input.PhoneID,
		CustomerID:     custIDPtr,
		RepairType:     input.RepairType,
		Description:    descPtr,
		PartCost:       input.PartCost,
		RepairPrice:    input.RepairPrice,
		DevicePassword: passPtr,
	}

	// 4. LƯU VÀO DB
	return s.Repo.Create(repair)
}

// UpdateRepairTicket: Sửa thông tin phiếu nhận (VD: Báo giá lại, cập nhật lỗi)
func (s *RepairService) UpdateRepairTicket(id int, input model.UpdateRepairInput) error {
	// 1. Kiểm tra tồn tại
	existingRepair, err := s.Repo.GetByID(id)
	if err != nil {
		return err
	}
	if existingRepair == nil {
		return errors.New("phiếu sửa chữa không tìm thấy")
	}
	// Ở bước này chỉ update giá/lỗi, KHÔNG sửa thông tin khách (thông tin khách sẽ sửa ở tab Khách hàng nếu cần)
	return s.Repo.Update(id, input)
}

// Lấy chi tiết phiếu sửa chữa
func (s *RepairService) GetRepairDetail(id int) (*model.RepairListItem, error) {
	return s.Repo.GetByID(id)
}

// GetRepairs: Lấy danh sách và format dữ liệu trả về cho Frontend
func (s *RepairService) GetRepairs(filter model.RepairFilter) ([]model.RepairListItem, int, map[string]int, error) {
	// 1. Validate cơ bản
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 {
		filter.Limit = 10
	}

	// 2. Gọi xuống Repo lấy dữ liệu thô
	items, total, err := s.Repo.GetAll(filter)
	if err != nil {
		return nil, 0, nil, err
	}

	// 3. Xử lý logic hiển thị Tên máy (DeviceName)
	for i := range items {
		items[i].DeviceName = "---"

		if items[i].PhoneModel != nil {
			// Máy của quán
			items[i].DeviceName = *items[i].PhoneModel
		} else if items[i].Description != nil {
			// Bóc tách tên máy từ chuỗi ghi chú (Máy vãng lai)
			desc := *items[i].Description
			if strings.HasPrefix(desc, "[Máy ngoài: ") {
				endIdx := strings.Index(desc, "]")
				if endIdx > -1 {
					items[i].DeviceName = desc[14:endIdx]
				}
			}
		}
	}

	// 4. Lấy thống kê
	repairingCount, completedCount, _ := s.Repo.GetStats()
	stats := map[string]int{
		"repairingCount":      repairingCount,
		"completedTodayCount": completedCount,
	}

	return items, total, stats, nil
}

// Xử lý Hoàn thành phiếu sửa & Xuất hoá đơn
func (s *RepairService) CompleteRepair(id int, userID int) (int, error) {
	// 1. Lấy thông tin phiếu sửa
	repair, err := s.Repo.GetByID(id)
	if err != nil {
		return 0, err
	}
	if repair == nil {
		return 0, errors.New("không tìm thấy phiếu sửa chữa")
	}

	// 2. Logic bóc tách Tên thiết bị (DeviceName)
	deviceName := "Thiết bị sửa chữa"
	if repair.PhoneModel != nil {
		deviceName = *repair.PhoneModel
	} else if repair.Description != nil {
		desc := *repair.Description
		if strings.HasPrefix(desc, "[Máy ngoài: ") {
			endIdx := strings.Index(desc, "]")
			if endIdx > -1 {
				deviceName = desc[14:endIdx]
			}
		}
	}

	// 3. Chuẩn bị Items cho Hoá đơn
	var items []model.CreateItemInput

	if repair.PartCost != nil && *repair.PartCost > 0 {
		items = append(items, model.CreateItemInput{
			ItemType:    model.ItemTypePart,
			PhoneID:     repair.PhoneID,
			Description: "Linh kiện thay thế: " + deviceName,
			Quantity:    1,
			UnitPrice:   *repair.PartCost,
		})
	}

	if repair.RepairPrice != nil && *repair.RepairPrice > 0 {
		items = append(items, model.CreateItemInput{
			ItemType:    model.ItemTypeService,
			PhoneID:     repair.PhoneID,
			Description: "Công sửa chữa: " + deviceName,
			Quantity:    1,
			UnitPrice:   *repair.RepairPrice,
		})
	}

	if len(items) == 0 {
		return 0, errors.New("phiếu sửa chữa chưa có chi phí (Linh kiện/Tiền công) nên không thể xuất hoá đơn")
	}

	// 4. Gọi InvoiceService tạo Hoá đơn
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

	// 5. Cập nhật trạng thái Phiếu sửa thành COMPLETED
	statusCompleted := "COMPLETED"
	err = s.Repo.Update(id, model.UpdateRepairInput{
		Status: &statusCompleted,
	})
	if err != nil {
		return 0, fmt.Errorf("đã tạo hoá đơn #%d nhưng lỗi cập nhật trạng thái phiếu sửa: %v", invoiceID, err)
	}

	return invoiceID, nil
}
