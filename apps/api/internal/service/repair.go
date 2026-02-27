package service

import (
	"api/internal/model"
	"api/internal/repository"
)

type RepairService struct {
	Repo            *repository.RepairRepo
	CustomerService *CustomerService // Dùng chung CustomerService để định danh
}

func NewRepairService(repo *repository.RepairRepo, custService *CustomerService) *RepairService {
	return &RepairService{
		Repo:            repo,
		CustomerService: custService,
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
	// Ở bước này chỉ update giá/lỗi, KHÔNG sửa thông tin khách (thông tin khách sẽ sửa ở tab Khách hàng nếu cần)
	return s.Repo.Update(id, input)
}

// Lấy chi tiết phiếu sửa chữa
func (s *RepairService) GetRepairDetail(id int) (*model.Repair, error) {
	return s.Repo.GetByID(id)
}
