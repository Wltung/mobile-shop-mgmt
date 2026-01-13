package service

import (
	"api/internal/model"
	"api/internal/repository"
	"errors"
	"time"
)

type PhoneService struct {
	Repo *repository.PhoneRepo
}

func NewPhoneService(repo *repository.PhoneRepo) *PhoneService {
	return &PhoneService{Repo: repo}
}

func (s *PhoneService) ImportPhone(input model.PhoneInput, userID int) error {
	// 1. Business Logic: Kiểm tra xem IMEI đã tồn tại chưa
	exists, err := s.Repo.GetByIMEI(input.IMEI)

	if err != nil {
		return err
	}

	if exists != nil {
		return errors.New("IMEI này đã tồn tại")
	}

	// 2. Chuẩn bị dữ liệu
	now := time.Now() // Ngày nhập mặc định là hôm nay

	importBy := userID

	// 2. Map dữ liệu từ Input sang Model
	phone := model.Phone{
		IMEI:          input.IMEI,
		ModelName:     input.ModelName,
		Details:       input.Details,
		PurchasePrice: input.PurchasePrice,
		Status:        "IN_STOCK",
		PurchaseDate:  &now,
		Note:          &input.Note,
		ImportBy:      &importBy,
	}

	// 3. Gọi Repo để lưu
	return s.Repo.Create(phone)
}

// Nhận userID từ Handler
func (s *PhoneService) GetPhones(userID int) ([]model.Phone, error) {
	return s.Repo.GetByUserID(userID)
}
