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
	exists, err := s.Repo.GetByIMEI(input.IMEI, userID)

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
		cust, err := s.CustomerRepo.GetByPhoneOrIdentity(input.SellerPhone, input.SellerID, userID)
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
				Name:      sellerName,
				Phone:     phonePtr,
				IDNumber:  idPtr,
				CreatedBy: userID,
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
func (s *PhoneService) GetPhones(userID int, filter model.PhoneFilter) ([]model.Phone, int, float64, error) {
	// Validate cơ bản
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 {
		filter.Limit = 5
	}

	return s.Repo.GetList(userID, filter)
}

// Hàm lấy chi tiết
func (s *PhoneService) GetPhoneDetail(id, userID int) (*model.Phone, error) {
	// Gọi xuống Repo
	return s.Repo.GetByID(id, userID)
}

func (s *PhoneService) UpdatePhone(id int, input model.PhoneInput, userID int) error {
	// 1. Lấy thông tin máy cũ để kiểm tra quyền sở hữu
	existingPhone, err := s.Repo.GetByID(id, userID)
	if err != nil {
		return err // Trả về lỗi nếu không tìm thấy
	}
	if existingPhone == nil {
		return errors.New("không tìm thấy máy hoặc không có quyền sửa")
	}

	// 2. Xử lý thông tin Người bán (Khách hàng)
	// Logic: Nếu thông tin người bán thay đổi, ta phải tìm hoặc tạo khách mới để lấy source_id mới
	var newSourceID *int = existingPhone.SourceID // Mặc định giữ nguyên khách cũ

	hasSellerInfo := input.SellerName != "" || input.SellerPhone != "" || input.SellerID != ""

	if hasSellerInfo {
		// Tái sử dụng logic tìm/tạo khách từ hàm ImportPhone
		cust, err := s.CustomerRepo.GetByPhoneOrIdentity(input.SellerPhone, input.SellerID, userID)
		if err != nil {
			return err
		}

		if cust != nil {
			newSourceID = &cust.ID // Đã có khách -> Lấy ID
		} else {
			// Tạo khách mới
			sellerName := input.SellerName
			if sellerName == "" {
				sellerName = "Khách vãng lai"
			}

			var phonePtr, idPtr *string
			if input.SellerPhone != "" {
				phonePtr = &input.SellerPhone
			}
			if input.SellerID != "" {
				idPtr = &input.SellerID
			}

			newID, err := s.CustomerRepo.Create(model.Customer{
				Name:      sellerName,
				Phone:     phonePtr,
				IDNumber:  idPtr,
				CreatedBy: userID,
			})
			if err != nil {
				return err
			}
			idVal := newID
			newSourceID = &idVal
		}
	}

	// 3. Map dữ liệu mới vào Model (Giữ lại ID và UserID cũ)
	updateData := model.Phone{
		ID:            id,
		ImportBy:      &userID, // Để đảm bảo WHERE condition trong Repo hoạt động đúng
		IMEI:          input.IMEI,
		ModelName:     input.ModelName,
		Status:        input.Status,
		PurchasePrice: input.PurchasePrice,
		Details:       input.Details,
		Note:          &input.Note,
		SourceID:      newSourceID,
		// PurchaseDate: Giữ nguyên hoặc update từ input nếu FE có gửi trường này
	}

	// Nếu FE có gửi ngày nhập (trong Details hoặc trường riêng), hãy cập nhật PurchaseDate tại đây
	// Ví dụ: updateData.PurchaseDate = parseTime(input.ImportDate)

	return s.Repo.Update(updateData)
}
