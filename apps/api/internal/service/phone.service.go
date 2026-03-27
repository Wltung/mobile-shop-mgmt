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
	return &PhoneService{
		Repo: repo,
	}
}

func (s *PhoneService) ImportPhone(input model.PhoneInput, userID int) (int, error) {
	// 1. KIỂM TRA IMEI
	exists, err := s.Repo.GetByIMEI(input.IMEI, userID)
	if err != nil {
		return 0, err
	}
	if exists != nil {
		return 0, errors.New("IMEI này đã tồn tại")
	}

	// 2. CHUẨN BỊ DỮ LIỆU PHONE (Không cần CustomerService nữa)
	now := time.Now()
	status := "IN_STOCK"

	var salePrice *int64
	if input.SalePrice > 0 {
		val := input.SalePrice
		salePrice = &val
	}

	importBy := userID

	// Tránh ghi string rỗng vào DB, dùng con trỏ nil
	var sName, sPhone, sIDNum *string
	if input.SellerName != "" {
		sName = &input.SellerName
	}
	if input.SellerPhone != "" {
		sPhone = &input.SellerPhone
	}
	if input.SellerID != "" {
		sIDNum = &input.SellerID
	}

	phone := model.Phone{
		IMEI:           input.IMEI,
		ModelName:      input.ModelName,
		Details:        input.Details,
		PurchasePrice:  input.PurchasePrice,
		Status:         status,
		SalePrice:      salePrice,
		PurchaseDate:   &now,
		Note:           &input.Note,
		ImportBy:       &importBy,
		SellerName:     sName,
		SellerPhone:    sPhone,
		SellerIDNumber: sIDNum,
	}

	// 3. LƯU VÀO DB
	return s.Repo.Create(phone)
}

func (s *PhoneService) GetImportPhones(userID int, filter model.PhoneFilter) ([]model.Phone, int, float64, map[string]interface{}, error) {
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 {
		filter.Limit = 5
	}

	items, total, totalVal, err := s.Repo.GetImports(userID, filter)
	if err != nil {
		return nil, 0, 0, nil, err
	}

	// ĐÃ FIX: Gọi hàm đếm Tồn kho
	inventoryCount, inventoryValue, _ := s.Repo.GetInventoryStats(userID)
	stats := map[string]interface{}{
		"inventoryCount": inventoryCount,
		"inventoryValue": inventoryValue,
	}

	return items, total, totalVal, stats, nil
}

func (s *PhoneService) GetSalePhones(userID int, filter model.PhoneFilter) ([]model.Phone, int, float64, map[string]interface{}, error) {
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 {
		filter.Limit = 5
	}

	items, total, totalVal, err := s.Repo.GetSales(userID, filter)
	if err != nil {
		return nil, 0, 0, nil, err
	}

	// ĐÃ FIX: Gọi Repo lấy Stats và đóng gói
	todayCount, todayRevenue, _ := s.Repo.GetDailySaleStats(userID)
	stats := map[string]interface{}{
		"todayCount":   todayCount,
		"todayRevenue": todayRevenue,
	}

	return items, total, totalVal, stats, nil
}

func (s *PhoneService) GetPhoneDetail(id, userID int) (*model.Phone, error) {
	return s.Repo.GetByID(id, userID)
}

func (s *PhoneService) UpdatePhone(id int, input model.PhoneUpdateInput, userID int) error {
	existingPhone, err := s.Repo.GetByID(id, userID)
	if err != nil {
		return err
	}
	if existingPhone == nil {
		return errors.New("máy không tìm thấy")
	}

	isPaid := existingPhone.InvoiceStatus != nil && *existingPhone.InvoiceStatus == "PAID"
	if isPaid {
		isChanged := func(in *string, db *string) bool {
			if in == nil {
				return false
			}
			inVal, dbVal := *in, ""
			if db != nil {
				dbVal = *db
			}
			return inVal != dbVal
		}

		if isChanged(input.SellerName, existingPhone.SellerName) ||
			isChanged(input.SellerPhone, existingPhone.SellerPhone) ||
			isChanged(input.SellerID, existingPhone.SellerIDNumber) {
			return errors.New("hoá đơn nhập máy này đã chốt (PAID), không thể thay đổi thông tin người bán")
		}
	}

	return s.Repo.UpdateDynamic(id, userID, input)
}

func (s *PhoneService) UpdatePhoneStatus(phoneID int, status string) error {
	validStatuses := map[string]bool{"IN_STOCK": true, "SOLD": true, "REPAIRING": true, "RETURNED": true}
	if !validStatuses[status] {
		return errors.New("trạng thái máy không hợp lệ")
	}
	return s.Repo.UpdateStatus(phoneID, status)
}

func (s *PhoneService) MarkPhoneAsSold(phoneID int, salePrice int64, saleDate time.Time) error {
	return s.Repo.MarkAsSold(phoneID, salePrice, saleDate)
}

func (s *PhoneService) RevertPhoneToInStock(phoneID int) error {
	return s.Repo.RevertToInStock(phoneID)
}

func (s *PhoneService) DeletePhone(id int, userID int) error {
	existingPhone, err := s.Repo.GetByID(id, userID)
	if err != nil {
		return err
	}
	if existingPhone == nil {
		return errors.New("không tìm thấy máy")
	}
	if existingPhone.Status != "IN_STOCK" {
		return errors.New("chỉ có thể xoá máy đang trong kho")
	}

	// ĐÃ FIX: Chặn đứng mọi nỗ lực xoá máy nếu nó có gắn với Hoá đơn
	if existingPhone.InvoiceID != nil {
		return errors.New("máy này đang gắn với một hoá đơn. Vui lòng gọi API xoá/huỷ hoá đơn thay vì xoá trực tiếp máy")
	}

	// Chỉ Xoá mềm với máy nhập lẻ (không qua hoá đơn)
	return s.Repo.SoftDelete(id, userID)
}

// Xoá cứng máy (Dành cho hoá đơn DRAFT)
func (s *PhoneService) HardDeletePhone(id int, userID int) error {
	return s.Repo.HardDelete(id, userID)
}

// Xoá mềm máy (Dành cho hoá đơn PAID) - Bỏ qua các check ràng buộc hoá đơn
func (s *PhoneService) SoftDeletePhoneBypass(id int, userID int) error {
	return s.Repo.SoftDelete(id, userID)
}
