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
	finalCustomerID, err := s.CustomerService.HandleCustomerForInvoice(input.Type, custInput, userID)
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

func (s *InvoiceService) UpdateInvoice(id int, input model.UpdateInvoiceInput, userID int) error {
	var newCustomerID *int = nil

	// 1. NẾU CÓ DỮ LIỆU KHÁCH HÀNG -> ĐỊNH DANH LẠI
	// (Check xem user có gửi thông tin khách hàng không)
	if input.CustomerName != nil {
		cName := *input.CustomerName
		cPhone := ""
		if input.CustomerPhone != nil {
			cPhone = *input.CustomerPhone
		}
		cIDNum := ""
		if input.CustomerIDNumber != nil {
			cIDNum = *input.CustomerIDNumber
		}

		custInput := model.CustomerIdentityInput{
			Name:     cName,
			Phone:    cPhone,
			IDNumber: cIDNum,
		}

		// Gọi Service để lấy ID (Cũ hoặc Mới)
		// Context là "SALE" hoặc lấy từ DB, tạm thời dùng "SALE" cho lỏng validate
		// hoặc bạn có thể query invoice type để truyền context chính xác.
		custID, err := s.CustomerService.HandleCustomerForInvoice("SALE", custInput, userID)
		if err != nil {
			return err
		}
		newCustomerID = custID
	}

	// 2. GỌI REPO UPDATE HOÁ ĐƠN
	return s.Repo.Update(id, input, newCustomerID)
}

func (s *InvoiceService) GetInvoices(filter model.InvoiceFilter) ([]model.Invoice, int, model.InvoiceStats, error) {
	// 1. Validate cơ bản
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 {
		filter.Limit = 10
	}

	// 2. Gọi xuống Repo lấy dữ liệu danh sách
	items, total, err := s.Repo.GetAll(filter)
	if err != nil {
		return nil, 0, model.InvoiceStats{}, err
	}

	// 3. Lấy thống kê trong ngày
	count, revenue, _ := s.Repo.GetDailyStats()
	stats := model.InvoiceStats{
		TotalCount:   count,
		TotalRevenue: revenue,
	}

	return items, total, stats, nil
}
