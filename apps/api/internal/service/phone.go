package service

import (
	"api/internal/model"
	"api/internal/repository"
	"errors"
)

type PhoneService struct {
	Repo *repository.PhoneRepo
}

func NewPhoneService(repo *repository.PhoneRepo) *PhoneService {
	return &PhoneService{Repo: repo}
}

func (s *PhoneService) ImportPhone(input model.PhoneInput) error {
	// 1. Business Logic: Kiểm tra xem IMEI đã tồn tại chưa
	exists, err := s.Repo.GetByIMEI(input.IMEI)

	if err != nil {
		return err
	}

	if exists != nil {
		return errors.New("IMEI này đã tồn tại")
	}

	// 2. Map dữ liệu từ Input sang Model
	phone := model.Phone{
		IMEI:          input.IMEI,
		ModelName:     input.ModelName,
		Details:       input.Details,
		PurchasePrice: input.PurchasePrice,
		Status:        "IN_STOCK",
	}

	// 3. Gọi Repo để lưu
	return s.Repo.Create(phone)
}
