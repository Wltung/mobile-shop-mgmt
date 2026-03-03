package service

import (
	"api/internal/model"
	"api/internal/repository"
	"errors"
	"time"
)

type WarrantyService struct {
	Repo            *repository.WarrantyRepo
	CustomerService *CustomerService
}

func NewWarrantyService(repo *repository.WarrantyRepo, custService *CustomerService) *WarrantyService {
	return &WarrantyService{Repo: repo, CustomerService: custService}
}

func (s *WarrantyService) CreateWarranty(input model.CreateWarrantyInput, userID int) (int, error) {
	// --- XÁC THỰC HẠN BẢO HÀNH TẠI BACKEND ---
	if input.EndDate == nil {
		return 0, errors.New("thiết bị không có thông tin hạn bảo hành")
	}

	now := time.Now()
	// Lấy mốc 00:00:00 của ngày hôm nay
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	endDate := input.EndDate.In(now.Location())
	// Lấy mốc 00:00:00 của ngày hết hạn
	endDay := time.Date(endDate.Year(), endDate.Month(), endDate.Day(), 0, 0, 0, 0, now.Location())

	// Nếu ngày hết hạn < ngày hôm nay -> Chặn luôn
	if endDay.Before(today) {
		return 0, errors.New("thiết bị đã hết hạn bảo hành, vui lòng chuyển sang tạo phiếu Sửa chữa dịch vụ")
	}
	// Định danh khách hàng (Dùng đúng input.Type thay vì hardcode "REPAIR")
	custInput := model.CustomerIdentityInput{
		Name:     input.CustomerName,
		Phone:    input.CustomerPhone,
		IDNumber: input.CustomerIDNumber,
	}
	custIDPtr, err := s.CustomerService.HandleCustomerForInvoice(input.Type, custInput, userID)
	if err != nil {
		return 0, err
	}

	var imeiPtr *string
	if input.IMEI != "" {
		imeiPtr = &input.IMEI
	}

	var techNotePtr *string
	if input.TechnicalNote != "" {
		techNotePtr = &input.TechnicalNote
	}

	warranty := model.Warranty{
		CustomerID:    custIDPtr,
		PhoneID:       input.PhoneID,
		InvoiceID:     input.InvoiceID,
		DeviceName:    &input.DeviceName,
		IMEI:          imeiPtr,
		Description:   &input.Description,
		TechnicalNote: techNotePtr, // <-- Map TechnicalNote
		StartDate:     input.StartDate,
		EndDate:       input.EndDate,
	}

	return s.Repo.Create(warranty)
}

func (s *WarrantyService) GetWarranties(filter model.WarrantyFilter) ([]model.WarrantyListItem, int, map[string]int, error) {
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

	// Lấy số liệu thống kê (nếu lỗi bỏ qua để không sập danh sách)
	stats, _ := s.Repo.GetStats()

	return items, total, stats, nil
}

func (s *WarrantyService) GetWarrantyDetail(id int) (*model.WarrantyListItem, error) {
	return s.Repo.GetByID(id)
}

func (s *WarrantyService) UpdateWarranty(id int, input model.UpdateWarrantyInput) error {
	return s.Repo.Update(id, input)
}

func (s *WarrantyService) SearchEligibleItems(keyword string, invType string) ([]model.WarrantySearchItem, error) {
	return s.Repo.SearchEligibleItems(keyword, invType)
}
