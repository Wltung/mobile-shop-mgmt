package service

import (
	"api/internal/model"
	"api/internal/repository"
	"errors"
)

type CustomerService struct {
	Repo *repository.CustomerRepo
}

func NewCustomerService(repo *repository.CustomerRepo) *CustomerService {
	return &CustomerService{Repo: repo}
}

// HandleCustomerForInvoice: Xử lý khách hàng dựa trên loại hoá đơn
func (s *CustomerService) HandleCustomerForInvoice(invoiceType string, input model.CustomerIdentityInput) (*int, error) {
	// 1. Ràng buộc theo loại Dịch vụ
	switch invoiceType {
	case "IMPORT":
		// NHẬP: Bắt buộc Tên + (CCCD hoặc SĐT)
		if input.Name == "" {
			return nil, errors.New("nhập hàng bắt buộc phải có tên người bán")
		}
		if input.Phone == "" && input.IDNumber == "" {
			return nil, errors.New("nhập hàng bắt buộc phải có SĐT hoặc CCCD người bán")
		}

	case "SALE", "REPAIR":
		// BÁN/SỬA: Không bắt buộc, nếu thiếu thông tin thì trả về NULL (Khách lẻ)
		if input.Name == "" && input.Phone == "" {
			return nil, nil
		}
	}

	// 2. Gọi Repo để xử lý GetOrCreate
	custID, err := s.Repo.GetOrCreate(input)
	if err != nil {
		return nil, err
	}

	// 3. Xử lý kết quả trả về
	if custID == 0 {
		return nil, nil // Trả về NULL database nếu là khách lẻ (id=0)
	}

	return &custID, nil
}
