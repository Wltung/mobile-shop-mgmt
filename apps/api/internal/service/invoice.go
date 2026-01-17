package service

import (
	"api/internal/model"
	"api/internal/repository"
	"fmt"
	"time"
)

type InvoiceService struct {
	Repo *repository.InvoiceRepo
}

func NewInvoiceService(repo *repository.InvoiceRepo) *InvoiceService {
	return &InvoiceService{Repo: repo}
}

// Hàm helper sinh mã (Private)
func (s *InvoiceService) generateInvoiceCode(invType string) (string, error) {
	// 1. Xác định Prefix
	prefix := "HD"
	switch invType {
	case "IMPORT":
		prefix = "HDN" // Hóa Đơn Nhập
	case "SALE":
		prefix = "HDB" // Hóa Đơn Bán
	case "REPAIR":
		prefix = "HDS" // Hóa Đơn Sửa
	default:
		prefix = "HDK" // Khác
	}

	// 2. Lấy ngày hiện tại (ddMMyyyy)
	now := time.Now()
	dateStr := now.Format("02012006") // Go format: 02(Day) 01(Month) 2006(Year)

	// 3. Lấy số thứ tự hiện tại trong ngày
	count, err := s.Repo.GetCountTodayByType(invType)
	if err != nil {
		return "", err
	}

	// Sequence = Count + 1 (Ví dụ: đang có 0 -> 1, đang có 5 -> 6)
	sequence := count + 1

	// 4. Ghép chuỗi: PREFIX-DATE-SEQ (001)
	// %03d nghĩa là số nguyên, đệm số 0 cho đủ 3 chữ số
	code := fmt.Sprintf("%s-%s-%03d", prefix, dateStr, sequence)

	return code, nil
}

func (s *InvoiceService) CreateInvoice(input model.CreateInvoiceInput, userID int) (int, error) {
	// 1. Tính toán items và tổng tiền
	var totalAmount float64
	var items []model.InvoiceItem

	for i, itemInput := range input.Items {
		if itemInput.ItemType == model.ItemTypePhone && itemInput.PhoneID == nil {
			return 0, fmt.Errorf("mục thứ %d: loại hàng là Điện thoại thì bắt buộc phải chọn máy (PhoneID)", i+1)
		}

		amount := float64(itemInput.Quantity) * itemInput.UnitPrice
		totalAmount += amount

		items = append(items, model.InvoiceItem{
			ItemType:       itemInput.ItemType,
			PhoneID:        itemInput.PhoneID,
			Description:    itemInput.Description,
			Quantity:       itemInput.Quantity,
			UnitPrice:      itemInput.UnitPrice,
			Amount:         amount,
			WarrantyMonths: itemInput.WarrantyMonths,
		})
	}

	// 2. Chuẩn bị Invoice Header
	status := input.Status
	if status == "" {
		status = model.InvoiceStatusPaid
	}

	code, err := s.generateInvoiceCode(input.Type)
	if err != nil {
		return 0, err
	}

	invoice := model.Invoice{
		InvoiceCode: code,
		Type:        input.Type,
		Status:      status,
		CustomerID:  input.CustomerID,
		TotalAmount: totalAmount,
		CreatedBy:   userID,
		CreatedAt:   time.Now(),
		Note:        input.Note,
	}

	// 3. Gọi Repo lưu
	return s.Repo.Create(invoice, items)
}

func (s *InvoiceService) GetInvoiceDetail(id int) (*model.Invoice, error) {
	return s.Repo.GetByID(id)
}
