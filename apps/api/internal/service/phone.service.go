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

func (s *PhoneService) ImportPhone(input model.PhoneInput, userID int, tenantID int) (int, error) {
	// 1. KIỂM TRA IMEI
	exists, err := s.Repo.GetByIMEI(input.IMEI, tenantID)
	if err != nil {
		return 0, err
	}
	if exists != nil {
		return 0, errors.New("IMEI này đã tồn tại")
	}

	// 2. CHUẨN BỊ DỮ LIỆU PHONE (Không cần CustomerService nữa)
	status := "IN_STOCK"

	now := time.Now()
	purchaseDate := &now

	// Nếu FE có gửi ngày lên, ta parse chuỗi đó ra time.Time
	if input.PurchaseDate != nil && *input.PurchaseDate != "" {
		// Thử parse theo định dạng YYYY-MM-DD
		if parsed, err := time.Parse("2006-01-02", *input.PurchaseDate); err == nil {
			purchaseDate = &parsed
		} else if parsedISO, err := time.Parse(time.RFC3339, *input.PurchaseDate); err == nil {
			// Thử parse theo ISO8601 nếu FE xài Date.toISOString()
			purchaseDate = &parsedISO
		}
	}

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
		TenantID:       tenantID,
		IMEI:           input.IMEI,
		ModelName:      input.ModelName,
		Details:        input.Details,
		PurchasePrice:  input.PurchasePrice,
		Status:         status,
		SalePrice:      salePrice,
		PurchaseDate:   purchaseDate,
		Note:           &input.Note,
		ImportBy:       &importBy,
		SellerName:     sName,
		SellerPhone:    sPhone,
		SellerIDNumber: sIDNum,
	}

	// 3. LƯU VÀO DB
	return s.Repo.Create(phone)
}

func (s *PhoneService) GetImportPhones(tenantID int, filter model.PhoneFilter) ([]model.Phone, int, float64, map[string]interface{}, error) {
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 {
		filter.Limit = 5
	}

	items, total, totalVal, err := s.Repo.GetImports(tenantID, filter)
	if err != nil {
		return nil, 0, 0, nil, err
	}

	// ĐÃ FIX: Gọi hàm đếm Tồn kho
	inventoryCount, inventoryValue, _ := s.Repo.GetInventoryStats(tenantID)
	stats := map[string]interface{}{
		"inventoryCount": inventoryCount,
		"inventoryValue": inventoryValue,
	}

	return items, total, totalVal, stats, nil
}

func (s *PhoneService) GetSalePhones(tenantID int, filter model.PhoneFilter) ([]model.Phone, int, float64, map[string]interface{}, error) {
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 {
		filter.Limit = 5
	}

	items, total, totalVal, err := s.Repo.GetSales(tenantID, filter)
	if err != nil {
		return nil, 0, 0, nil, err
	}

	// ĐÃ FIX: Gọi Repo lấy Stats và đóng gói
	todayCount, todayRevenue, _ := s.Repo.GetDailySaleStats(tenantID)
	stats := map[string]interface{}{
		"todayCount":   todayCount,
		"todayRevenue": todayRevenue,
	}

	return items, total, totalVal, stats, nil
}

func (s *PhoneService) GetPhoneDetail(id, tenantID int) (*model.Phone, error) {
	return s.Repo.GetByID(id, tenantID)
}

func (s *PhoneService) UpdatePhone(id int, input model.PhoneUpdateInput, tenantID int) error {
	existingPhone, err := s.Repo.GetByID(id, tenantID)
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

	return s.Repo.UpdateDynamic(id, tenantID, input)
}

func (s *PhoneService) UpdatePhoneStatus(phoneID int, status string, tenantID int) error {
	validStatuses := map[string]bool{"IN_STOCK": true, "SOLD": true, "REPAIRING": true, "RETURNED": true}
	if !validStatuses[status] {
		return errors.New("trạng thái máy không hợp lệ")
	}
	return s.Repo.UpdateStatus(phoneID, status, tenantID)
}

func (s *PhoneService) MarkPhoneAsSold(phoneID int, salePrice int64, saleDate time.Time, tenantID int) error {
	return s.Repo.MarkAsSold(phoneID, salePrice, saleDate, tenantID)
}

func (s *PhoneService) RevertPhoneToInStock(phoneID int, tenantID int) error {
	return s.Repo.RevertToInStock(phoneID, tenantID)
}

func (s *PhoneService) DeletePhone(id int, tenantID int) error {
	existingPhone, err := s.Repo.GetByID(id, tenantID)
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
	return s.Repo.SoftDelete(id, tenantID)
}

// Xoá cứng máy (Dành cho hoá đơn DRAFT)
func (s *PhoneService) HardDeletePhone(id int, tenantID int) error {
	existingPhone, err := s.Repo.GetByID(id, tenantID)
	if err != nil {
		return err
	}
	// CHẶN ĐỨNG: Không cho xoá máy nếu đã bán hoặc đang sửa
	if existingPhone != nil && existingPhone.Status != "IN_STOCK" {
		return errors.New("không thể xoá hoá đơn vì có máy đã xuất khỏi kho. Vui lòng huỷ phiếu xuất/bán trước")
	}
	return s.Repo.HardDelete(id, tenantID)
}

// Xoá mềm máy (Dành cho hoá đơn PAID) - Bỏ qua các check ràng buộc hoá đơn
func (s *PhoneService) SoftDeletePhoneBypass(id int, tenantID int) error {
	existingPhone, err := s.Repo.GetByID(id, tenantID)
	if err != nil {
		return err
	}
	// CHẶN ĐỨNG TẬN GỐC: Không cho huỷ hoá đơn nhập nếu máy bên trong đã bị bán
	if existingPhone != nil && existingPhone.Status != "IN_STOCK" {
		return errors.New("không thể huỷ hoá đơn vì chứa máy đã bán (SOLD). Vui lòng huỷ hoá đơn bán trước")
	}
	return s.Repo.SoftDelete(id, tenantID)
}
