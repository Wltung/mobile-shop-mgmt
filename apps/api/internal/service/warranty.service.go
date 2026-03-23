package service

import (
	"api/internal/model"
	"api/internal/repository"
	"errors"
	"time"
)

type WarrantyService struct {
	Repo *repository.WarrantyRepo
}

func NewWarrantyService(repo *repository.WarrantyRepo) *WarrantyService {
	return &WarrantyService{Repo: repo}
}

func (s *WarrantyService) CreateWarranty(input model.CreateWarrantyInput, userID int) (int, error) {
	// --- XÁC THỰC HẠN BẢO HÀNH ---
	if input.EndDate == nil {
		return 0, errors.New("thiết bị không có thông tin hạn bảo hành")
	}

	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	endDate := input.EndDate.In(now.Location())
	endDay := time.Date(endDate.Year(), endDate.Month(), endDate.Day(), 0, 0, 0, 0, now.Location())

	if endDay.Before(today) {
		return 0, errors.New("thiết bị đã hết hạn bảo hành, không thể tạo phiếu")
	}

	// --- MAP DATA ---
	var imeiPtr *string
	if input.IMEI != "" {
		imeiPtr = &input.IMEI
	}

	var techNotePtr *string
	if input.TechnicalNote != "" {
		techNotePtr = &input.TechnicalNote
	}

	var cName *string
	if input.CustomerName != "" {
		cName = &input.CustomerName
	}

	var cPhone *string
	if input.CustomerPhone != "" {
		cPhone = &input.CustomerPhone
	}

	warranty := model.Warranty{
		CustomerName:  cName,
		CustomerPhone: cPhone,
		PhoneID:       input.PhoneID,
		InvoiceID:     input.InvoiceID,
		DeviceName:    &input.DeviceName,
		IMEI:          imeiPtr,
		Description:   &input.Description,
		TechnicalNote: techNotePtr,
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

	stats, _ := s.Repo.GetStats()
	return items, total, stats, nil
}

func (s *WarrantyService) GetWarrantyDetail(id int) (*model.WarrantyListItem, error) {
	return s.Repo.GetByID(id)
}

func (s *WarrantyService) UpdateWarranty(id int, input model.UpdateWarrantyInput) error {
	return s.Repo.Update(id, input)
}

func (s *WarrantyService) SearchWarranty(keyword string, invType string) ([]model.WarrantySearchItem, error) {
	return s.Repo.SearchWarranty(keyword, invType)
}
