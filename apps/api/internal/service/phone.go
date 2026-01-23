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
		cust, err := s.CustomerRepo.GetMatchCustomer(input.SellerName, input.SellerPhone, input.SellerID, userID)
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
func (s *PhoneService) GetImportPhones(userID int, filter model.PhoneFilter) ([]model.Phone, int, float64, error) {
	// Validate cơ bản
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 {
		filter.Limit = 5
	}

	return s.Repo.GetImports(userID, filter)
}

// Hàm cho trang Lịch sử bán
func (s *PhoneService) GetSalePhones(userID int, filter model.PhoneFilter) ([]model.Phone, int, float64, error) {
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 {
		filter.Limit = 5
	}
	return s.Repo.GetSales(userID, filter)
}

// Hàm lấy chi tiết
func (s *PhoneService) GetPhoneDetail(id, userID int) (*model.Phone, error) {
	// Gọi xuống Repo
	return s.Repo.GetByID(id, userID)
}

func (s *PhoneService) UpdatePhone(id int, input model.PhoneUpdateInput, userID int) error {
	// 1. Kiểm tra tồn tại
	existingPhone, err := s.Repo.GetByID(id, userID)
	if err != nil {
		return err
	}
	if existingPhone == nil {
		return errors.New("máy không tìm thấy")
	}

	// 2. Xử lý thông tin Người Bán (Chỉ chạy nếu có gửi 1 trong các trường liên quan)
	var newSourceID *int = nil // Mặc định nil (không update cột này)

	// Kiểm tra xem user có gửi thông tin seller không
	hasSellerUpdate := input.SellerName != nil || input.SellerPhone != nil || input.SellerID != nil

	if hasSellerUpdate {
		// Lấy giá trị từ input hoặc fallback về giá trị cũ nếu input thiếu
		// (Logic này tuỳ bạn: Patch là thay thế hay merge? Ở đây giả sử merge với cái cũ nếu thiếu)

		sName := ""
		if input.SellerName != nil {
			sName = *input.SellerName
		} else if existingPhone.SellerName != nil {
			sName = *existingPhone.SellerName
		}

		sPhone := ""
		if input.SellerPhone != nil {
			sPhone = *input.SellerPhone
		} else if existingPhone.SellerPhone != nil {
			sPhone = *existingPhone.SellerPhone
		}

		sID := ""
		if input.SellerID != nil {
			sID = *input.SellerID
		} else if existingPhone.SellerIDNumber != nil {
			sID = *existingPhone.SellerIDNumber
		}

		// Xử lý các con trỏ string để lưu vào DB (nếu rỗng thì lưu NULL)
		var pPtr, iPtr *string
		if sPhone != "" {
			pPtr = &sPhone
		}
		if sID != "" {
			iPtr = &sID
		}
		if sName == "" {
			sName = "Khách vãng lai"
		}

		// LOGIC MỚI:
		// Trường hợp A: Máy đã có người bán (SourceID != nil) -> Cập nhật thông tin người đó
		if existingPhone.SourceID != nil {
			err := s.CustomerRepo.Update(model.Customer{
				ID:        *existingPhone.SourceID,
				Name:      sName,
				Phone:     pPtr,
				IDNumber:  iPtr,
				CreatedBy: userID,
			})
			if err != nil {
				return err
			}
			// Giữ nguyên SourceID cũ (chỉ cập nhật nội dung)
			// Lưu ý: Nếu muốn truyền newSourceID vào UpdateDynamic, ta có thể gán nó bằng SourceID cũ
			// Tuy nhiên, logic repo UpdateDynamic thường chỉ update nếu source_id khác nil.
			// Ở đây ta đã update customer rồi, không cần update source_id trong bảng phones nữa.
		} else {
			// Trường hợp B: Máy chưa có người bán (SourceID == nil) -> Tìm hoặc Tạo mới (Logic cũ)

			// Tìm khách cũ theo SĐT/CCCD
			cust, err := s.CustomerRepo.GetMatchCustomer(sName, sPhone, sID, userID)
			if err != nil {
				return err
			}

			if cust != nil {
				// Tìm thấy -> Link tới ID khách này
				idVal := cust.ID
				newSourceID = &idVal
			} else {
				// Chưa có -> Tạo khách mới
				newID, err := s.CustomerRepo.Create(model.Customer{
					Name:      sName,
					Phone:     pPtr,
					IDNumber:  iPtr,
					CreatedBy: userID,
				})
				if err != nil {
					return err
				}
				idVal := newID
				newSourceID = &idVal
			}
		}
	}

	// 3. Gọi Repo Dynamic Update
	return s.Repo.UpdateDynamic(id, userID, input, newSourceID)
}
