package service

import (
	"api/internal/model"
	"api/internal/repository"
	"errors"
	"time"
)

type PhoneService struct {
	Repo         *repository.PhoneRepo
	CustomerRepo *repository.CustomerRepo
}

func NewPhoneService(repo *repository.PhoneRepo, custRepo *repository.CustomerRepo) *PhoneService {
	return &PhoneService{
		Repo:         repo,
		CustomerRepo: custRepo,
	}
}

func (s *PhoneService) ImportPhone(input model.PhoneInput, userID int) (int, *int, error) {
	// 1. Business Logic: Kiểm tra xem IMEI đã tồn tại chưa
	exists, err := s.Repo.GetByIMEI(input.IMEI)

	if err != nil {
		return 0, nil, err
	}

	if exists != nil {
		return 0, nil, errors.New("IMEI này đã tồn tại")
	}

	var sourceID *int = nil

	hasSellerInfo := input.SellerName != "" || input.SellerPhone != "" || input.SellerID != ""

	if hasSellerInfo {
		// Tìm khách cũ
		cust, err := s.CustomerRepo.GetByPhoneOrIdentity(input.SellerPhone, input.SellerID)
		if err != nil {
			return 0, nil, err
		}

		if cust != nil {
			sourceID = &cust.ID // Lấy ID khách cũ
		} else {
			// Tạo khách mới
			// Xử lý pointer cho string rỗng để lưu NULL vào DB Customer nếu cần
			var phonePtr *string
			var idPtr *string
			if input.SellerPhone != "" {
				phonePtr = &input.SellerPhone
			}
			if input.SellerID != "" {
				idPtr = &input.SellerID
			}

			// Validate: Nếu không có tên thì đặt tên mặc định hoặc báo lỗi
			sellerName := input.SellerName
			if sellerName == "" {
				sellerName = "Khách vãng lai"
			}

			newID, err := s.CustomerRepo.Create(model.Customer{
				Name:     sellerName,
				Phone:    phonePtr,
				IDNumber: idPtr,
			})
			if err != nil {
				return 0, nil, err
			}

			// Ép kiểu int về *int
			idVal := newID
			sourceID = &idVal
		}
	}

	// 2. Chuẩn bị dữ liệu
	now := time.Now() // Ngày nhập mặc định là hôm nay

	importBy := userID

	status := input.Status
	if status == "" {
		status = "IN_STOCK"
	}

	// 2. Map dữ liệu từ Input sang Model
	phone := model.Phone{
		IMEI:          input.IMEI,
		ModelName:     input.ModelName,
		Details:       input.Details,
		PurchasePrice: input.PurchasePrice,
		Status:        status,
		PurchaseDate:  &now,
		Note:          &input.Note,
		ImportBy:      &importBy,
		SourceID:      sourceID,
	}

	newPhoneID, err := s.Repo.Create(phone)
	if err != nil {
		return 0, nil, err
	}

	// 3. Gọi Repo để lưu
	return newPhoneID, sourceID, nil
}

// Nhận userID từ Handler
func (s *PhoneService) GetPhones(userID, page, limit int) ([]model.Phone, int, float64, error) {
	// Validate cơ bản
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 5
	}

	return s.Repo.GetByUserID(userID, page, limit)
}
