package service

import (
	"api/internal/model"
	"api/internal/repository"
	"fmt"
	"time"
)

type InvoiceService struct {
	Repo            *repository.InvoiceRepo
	CustomerService *CustomerService
}

func NewInvoiceService(repo *repository.InvoiceRepo, custService *CustomerService) *InvoiceService {
	return &InvoiceService{
		Repo:            repo,
		CustomerService: custService,
	}
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
	// ------------------------------------------------------------------
	// 1. XỬ LÝ KHÁCH HÀNG (Thông qua CustomerService)
	// ------------------------------------------------------------------

	// Chuẩn bị dữ liệu định danh
	custInput := model.CustomerIdentityInput{
		Name:  input.CustomerName,
		Phone: input.CustomerPhone,
		// Lưu ý: Input model cần có trường CustomerIDNumber (đã thêm ở bước trước)
		// Nếu chưa có trong model gốc, bạn cần đảm bảo struct CreateInvoiceInput đã có field này.
		IDNumber: input.CustomerIDNumber,
	}

	// Gọi Service để xử lý logic nghiệp vụ:
	// - IMPORT: Bắt buộc Tên + (SĐT/CCCD)
	// - SALE: Không bắt buộc (nếu trống -> Khách lẻ)
	// - Tự động tìm khách cũ hoặc tạo mới
	finalCustomerID, err := s.CustomerService.HandleCustomerForInvoice(input.Type, custInput)
	if err != nil {
		return 0, err
	}

	// ------------------------------------------------------------------
	// 2. TÍNH TOÁN ITEMS & TỔNG TIỀN
	// ------------------------------------------------------------------
	var totalAmount int64 = 0
	var items []model.InvoiceItem

	for i, itemInput := range input.Items {
		if itemInput.ItemType == model.ItemTypePhone && itemInput.PhoneID == nil {
			return 0, fmt.Errorf("mục thứ %d: điện thoại bắt buộc phải chọn máy (PhoneID)", i+1)
		}

		amount := int64(itemInput.Quantity) * itemInput.UnitPrice
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

	// ------------------------------------------------------------------
	// 3. TẠO HEADER HOÁ ĐƠN
	// ------------------------------------------------------------------
	status := input.Status
	if status == "" {
		status = model.InvoiceStatusPaid
	}

	code, err := s.generateInvoiceCode(input.Type)
	if err != nil {
		return 0, err
	}

	invoice := model.Invoice{
		InvoiceCode:   code,
		Type:          input.Type,
		Status:        status,
		PaymentMethod: input.PaymentMethod,
		CustomerID:    finalCustomerID, // Sử dụng ID đã xử lý
		TotalAmount:   totalAmount,
		CreatedBy:     userID,
		CreatedAt:     time.Now(),
		Note:          input.Note,
	}

	// 4. LƯU VÀO DB
	return s.Repo.Create(invoice, items)
}

func (s *InvoiceService) GetInvoiceDetail(id int) (*model.Invoice, error) {
	return s.Repo.GetByID(id)
}

func (s *InvoiceService) UpdateStatus(id int, status string) error {
	// Có thể thêm logic kiểm tra user permissions tại đây nếu cần
	return s.Repo.UpdateStatus(id, status)
}

func (s *InvoiceService) UpdateInvoice(id int, input model.UpdateInvoiceInput) error {
	return s.Repo.Update(id, input)
}
