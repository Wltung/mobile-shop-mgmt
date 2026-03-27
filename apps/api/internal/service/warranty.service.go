package service

import (
	"api/internal/model"
	"api/internal/repository"
	"encoding/json"
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
	// 1. XÁC THỰC HẠN BẢO HÀNH
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

	// 2. ĐÓNG GÓI 2 CHUỖI JSON
	descObj := model.WarrantyDescription{
		Condition: input.Condition,
		Fault:     input.Fault,
		PartName:  input.PartName,
	}
	descBytes, _ := json.Marshal(descObj)
	descStr := string(descBytes)

	techObj := model.WarrantyTechnicalNote{
		SpecialNote:       input.SpecialNote,
		WarrantyCondition: input.WarrantyCondition,
	}
	techBytes, _ := json.Marshal(techObj)
	techStr := string(techBytes)

	// 3. MAP DATA
	var imeiPtr *string
	if input.IMEI != "" {
		imeiPtr = &input.IMEI
	}

	warranty := model.Warranty{
		PhoneID:       input.PhoneID,
		InvoiceID:     input.InvoiceID,
		DeviceName:    &input.DeviceName,
		IMEI:          imeiPtr,
		Description:   &descStr,
		TechnicalNote: &techStr,
		Cost:          input.Cost,
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

	// PARSE 2 CỤC JSON
	for i := range items {
		if items[i].Description != nil {
			var descObj model.WarrantyDescription
			if err := json.Unmarshal([]byte(*items[i].Description), &descObj); err == nil {
				items[i].DescriptionJSON = &descObj
			}
		}
		if items[i].TechnicalNote != nil {
			var techObj model.WarrantyTechnicalNote
			if err := json.Unmarshal([]byte(*items[i].TechnicalNote), &techObj); err == nil {
				items[i].TechnicalNoteJSON = &techObj
			}
		}
	}

	stats, _ := s.Repo.GetStats()
	return items, total, stats, nil
}

func (s *WarrantyService) GetWarrantyDetail(id int) (*model.WarrantyListItem, error) {
	item, err := s.Repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	// PARSE 2 CỤC JSON
	if item != nil {
		if item.Description != nil {
			var descObj model.WarrantyDescription
			if err := json.Unmarshal([]byte(*item.Description), &descObj); err == nil {
				item.DescriptionJSON = &descObj
			}
		}
		if item.TechnicalNote != nil {
			var techObj model.WarrantyTechnicalNote
			if err := json.Unmarshal([]byte(*item.TechnicalNote), &techObj); err == nil {
				item.TechnicalNoteJSON = &techObj
			}
		}
	}

	return item, nil
}

func (s *WarrantyService) UpdateWarranty(id int, input model.UpdateWarrantyInput) error {
	existing, err := s.GetWarrantyDetail(id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("không tìm thấy phiếu bảo hành")
	}

	// 1. Cập nhật cục JSON Description
	var descObj model.WarrantyDescription
	if existing.Description != nil {
		json.Unmarshal([]byte(*existing.Description), &descObj)
	}
	isDescUpdated := false
	if input.Condition != nil {
		descObj.Condition = *input.Condition
		isDescUpdated = true
	}
	if input.Fault != nil {
		descObj.Fault = *input.Fault
		isDescUpdated = true
	}

	if isDescUpdated {
		b, _ := json.Marshal(descObj)
		str := string(b)
		input.Description = &str // Gán vào input ẩn để gửi xuống Repo
	}

	// 2. Cập nhật cục JSON TechnicalNote
	var techObj model.WarrantyTechnicalNote
	if existing.TechnicalNote != nil {
		json.Unmarshal([]byte(*existing.TechnicalNote), &techObj)
	}
	isTechUpdated := false
	if input.SpecialNote != nil {
		techObj.SpecialNote = *input.SpecialNote
		isTechUpdated = true
	}
	if input.WarrantyCondition != nil {
		techObj.WarrantyCondition = *input.WarrantyCondition
		isTechUpdated = true
	}

	if isTechUpdated {
		b, _ := json.Marshal(techObj)
		str := string(b)
		input.TechnicalNote = &str // Gán vào input ẩn để gửi xuống Repo
	}

	return s.Repo.Update(id, input)
}

func (s *WarrantyService) SearchWarranty(keyword string, invType string) ([]model.WarrantySearchItem, error) {
	return s.Repo.SearchWarranty(keyword, invType)
}

func (s *WarrantyService) DeleteWarranty(id int) error {
	existing, err := s.GetWarrantyDetail(id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("không tìm thấy phiếu bảo hành")
	}

	// Phân luồng thông minh
	if existing.Status == "RECEIVED" {
		// Nháp, mới tạo -> Bay màu
		return s.Repo.HardDelete(id)
	}

	// Đã xử lý / Đã xong -> Xoá mềm giấu đi
	return s.Repo.SoftDelete(id)
}
