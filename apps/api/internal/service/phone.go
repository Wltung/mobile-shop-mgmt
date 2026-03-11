package service

import (
	"api/internal/model"
	"api/internal/repository"
	"errors"
	"time"
)

type PhoneService struct {
	Repo            *repository.PhoneRepo
	CustomerService *CustomerService
}

func NewPhoneService(repo *repository.PhoneRepo, custService *CustomerService) *PhoneService {
	return &PhoneService{
		Repo:            repo,
		CustomerService: custService,
	}
}

func (s *PhoneService) ImportPhone(input model.PhoneInput, userID int) (int, *int, error) {
	// ---------------------------------------------------------
	// 1. BUSINESS LOGIC: KIỂM TRA IMEI
	// ---------------------------------------------------------
	exists, err := s.Repo.GetByIMEI(input.IMEI, userID)

	if err != nil {
		return 0, nil, err
	}

	if exists != nil {
		return 0, nil, errors.New("IMEI này đã tồn tại")
	}

	// ---------------------------------------------------------
	// 2. XỬ LÝ KHÁCH HÀNG (Qua CustomerService)
	// ---------------------------------------------------------
	// Chuyển đổi dữ liệu từ PhoneInput sang CustomerIdentityInput
	// Lưu ý: SellerID trong PhoneInput tương ứng với CCCD (IDNumber)
	custInput := model.CustomerIdentityInput{
		Name:     input.SellerName,
		Phone:    input.SellerPhone,
		IDNumber: input.SellerID,
	}

	// Gọi CustomerService với context "IMPORT".
	// Hàm này sẽ tự động:
	// - Validate (bắt buộc Tên + SĐT/CCCD)
	// - Tìm khách cũ hoặc Tạo mới
	// - Enrich dữ liệu thiếu
	sourceID, err := s.CustomerService.HandleCustomerForInvoice("IMPORT", custInput, userID)
	if err != nil {
		return 0, nil, err
	}

	// ---------------------------------------------------------
	// 3. CHUẨN BỊ DỮ LIỆU PHONE
	// ---------------------------------------------------------
	now := time.Now() // Ngày nhập mặc định là hôm nay

	status := "IN_STOCK"

	// Xử lý logic SalePrice (Giá bán dự kiến)
	// Nếu input.SalePrice = 0 thì coi như chưa có giá bán (NULL trong DB)
	var salePrice *int64
	if input.SalePrice > 0 {
		val := input.SalePrice
		salePrice = &val
	}

	importBy := userID

	// 2. Map dữ liệu từ Input sang Model
	phone := model.Phone{
		IMEI:          input.IMEI,
		ModelName:     input.ModelName,
		Details:       input.Details,
		PurchasePrice: input.PurchasePrice,

		Status:       status,
		SalePrice:    salePrice,
		PurchaseDate: &now,
		Note:         &input.Note,

		ImportBy: &importBy,
		SourceID: sourceID,
	}

	// ---------------------------------------------------------
	// 4. LƯU VÀO DB
	// ---------------------------------------------------------
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

	// ---------------------------------------------------------
	// 2. XỬ LÝ CẬP NHẬT NGƯỜI BÁN (SOURCE / CUSTOMER)
	// ---------------------------------------------------------
	var newSourceID *int = nil

	// Chỉ xử lý logic khách hàng nếu có gửi thông tin người bán lên (SellerName != nil)
	if input.SellerName != nil {
		// Chuẩn bị dữ liệu input cho CustomerService
		// Helper để lấy string từ pointer an toàn
		sName := *input.SellerName
		sPhone := ""
		if input.SellerPhone != nil {
			sPhone = *input.SellerPhone
		}
		sID := "" // SellerID tương ứng với CCCD
		if input.SellerID != nil {
			sID = *input.SellerID
		}

		custInput := model.CustomerIdentityInput{
			Name:     sName,
			Phone:    sPhone,
			IDNumber: sID,
		}

		// Gọi CustomerService với context "IMPORT" (vì nguồn gốc máy nhập vào cần định danh rõ)
		// Logic bên trong sẽ tự động:
		// - Tìm khách cũ khớp SĐT/CCCD -> Trả về ID cũ + Update thông tin mới (Enrich)
		// - Hoặc tạo khách mới nếu chưa có
		// - Validate tên bắt buộc
		sourceID, err := s.CustomerService.HandleCustomerForInvoice("IMPORT", custInput, userID)
		if err != nil {
			return err
		}

		newSourceID = sourceID
	}

	// 3. Gọi Repo Dynamic Update
	return s.Repo.UpdateDynamic(id, userID, input, newSourceID)
}

// UpdatePhoneStatus: Hàm nội bộ phục vụ cho các module khác gọi đến (Repair, Invoice...)
func (s *PhoneService) UpdatePhoneStatus(phoneID int, status string) error {
	// 1. Có thể đặt validation ở đây
	validStatuses := map[string]bool{"IN_STOCK": true, "SOLD": true, "REPAIRING": true, "RETURNED": true}
	if !validStatuses[status] {
		return errors.New("trạng thái máy không hợp lệ")
	}

	// 2. Gọi Repo để update
	return s.Repo.UpdateStatus(phoneID, status)
}
