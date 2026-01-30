package service

import (
	"api/internal/model"
	"api/internal/repository"
	"errors"
	"fmt"
	"time"
)

type InvoiceService struct {
	Repo         *repository.InvoiceRepo
	CustomerRepo *repository.CustomerRepo
}

func NewInvoiceService(repo *repository.InvoiceRepo, custRepo *repository.CustomerRepo) *InvoiceService {
	return &InvoiceService{
		Repo:         repo,
		CustomerRepo: custRepo,
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
	var finalCustomerID *int = input.CustomerID

	// 1. LOGIC TỰ ĐỘNG TÌM/TẠO KHÁCH HÀNG (Giống hệt ImportPhone)
	// Nếu FE không gửi ID (null), ta dùng Tên & SĐT để xử lý
	if finalCustomerID == nil {
		// Validate: Phải có ít nhất Tên để tạo
		if input.CustomerName == "" {
			return 0, errors.New("vui lòng nhập tên khách hàng")
		}

		// Gọi Repo để tìm khách cũ (Khớp Tên + SĐT)
		// Lưu ý: IDNumber để rỗng vì bán hàng thường ít khi nhập CCCD
		cust, err := s.CustomerRepo.GetMatchCustomer(input.CustomerName, input.CustomerPhone, "", userID)
		if err != nil {
			return 0, err
		}

		if cust != nil {
			// Case A: Tìm thấy -> Dùng ID khách cũ
			idVal := cust.ID
			finalCustomerID = &idVal
		} else {
			// Case B: Không thấy -> Tạo khách mới
			cName := input.CustomerName
			// Nếu tên rỗng (phòng hờ) thì đặt mặc định
			if cName == "" {
				cName = "Khách lẻ"
			}

			var cPhone *string
			if input.CustomerPhone != "" {
				cPhone = &input.CustomerPhone
			}

			newID, err := s.CustomerRepo.Create(model.Customer{
				Name:  cName,
				Phone: cPhone,
				// IDNumber: nil, // Bán hàng không bắt buộc CCCD
				CreatedBy: userID,
			})
			if err != nil {
				return 0, err
			}

			idVal := newID
			finalCustomerID = &idVal
		}
	}

	// Validate cuối cùng: Nếu sau tất cả vẫn không có CustomerID
	if finalCustomerID == nil {
		return 0, errors.New("không xác định được khách hàng")
	}

	// [FIX LỖI PANIC TẠI ĐÂY]
	// Dùng *finalCustomerID thay vì *input.CustomerID
	custCheck, err := s.CustomerRepo.GetByID(*finalCustomerID, userID)
	if err != nil {
		return 0, err
	}
	if custCheck == nil {
		return 0, errors.New("khách hàng không tồn tại trong hệ thống")
	}

	// 2. TÍNH TOÁN ITEMS & TỔNG TIỀN
	var totalAmount int64
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

	// 3. TẠO INVOICE HEADER
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
