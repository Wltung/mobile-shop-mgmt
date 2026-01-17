package model

import (
	"time"
)

// Phone đại diện cho bảng 'phones' trong Database
type Phone struct {
	ID        int    `db:"id" json:"id"`
	IMEI      string `db:"imei" json:"imei"`
	ModelName string `db:"model_name" json:"model_name"`

	// Details: Lưu màu sắc, dung lượng, tình trạng pin... (Cột JSON)
	Details JSONMap `db:"details" json:"details"`

	// Status: 'IN_STOCK', 'SOLD', 'REPAIRING', 'RETURNED'
	Status string `db:"status" json:"status"`

	PurchasePrice float64 `db:"purchase_price" json:"purchase_price"`

	// SalePrice là con trỏ (*float64) vì trong DB nó có thể NULL (khi chưa bán)
	SalePrice *float64 `db:"sale_price" json:"sale_price"`

	// PurchaseDate: Thời gian mua điện thoại (cột datetime)
	PurchaseDate *time.Time `db:"purchase_date" json:"purchase_date"`

	//SaleDate: Thời gian bán điện thoại (cột datetime)
	SaleDate *time.Time `db:"sale_date" json:"sale_date"`

	// Note cũng có thể NULL nên dùng *string (hoặc string nếu bạn xử lý NULL trong SQL)
	Note *string `db:"note" json:"note"`

	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`

	ImportBy     *int   `db:"import_by" json:"import_by"`         // Lưu ID người nhập
	ImporterName string `db:"importer_name" json:"importer_name"` // Field này để hứng dữ liệu khi JOIN (không có trong bảng phones gốc)

	SourceID *int `db:"source_id" json:"source_id"` // ID người bán (khách hàng)

	// --- CÁC TRƯỜNG MỚI ĐỂ HỨNG DỮ LIỆU JOIN TỪ CUSTOMERS ---
	// Dùng con trỏ (*string) vì có thể null nếu không có người bán (nhập tồn kho cũ)
	SellerName     *string `db:"seller_name" json:"seller_name,omitempty"`
	SellerPhone    *string `db:"seller_phone" json:"seller_phone,omitempty"`
	SellerIDNumber *string `db:"seller_id_number" json:"seller_id_number,omitempty"`

	InvoiceCode *string `db:"invoice_code" json:"invoice_code"`
}

// PhoneInput: Struct dùng để hứng dữ liệu từ Frontend gửi lên (khi tạo/sửa)
// Tách riêng để validate dễ hơn và không bị dính các trường hệ thống (ID, CreatedAt)
type PhoneInput struct {
	IMEI          string  `json:"imei" binding:"required"`
	ModelName     string  `json:"model_name" binding:"required"`
	Status        string  `json:"status"`
	Details       JSONMap `json:"details"` // Frontend gửi JSON object lên
	PurchasePrice float64 `json:"purchase_price" binding:"required"`
	Note          string  `json:"note"`

	// --- THÊM MỚI (Nhận từ FE) ---
	SellerName  string `json:"seller_name"`
	SellerPhone string `json:"seller_phone"`
	SellerID    string `json:"seller_id"` // CCCD
}

type PhoneFilter struct {
	Page      int    `form:"page"`
	Limit     int    `form:"limit"`
	Keyword   string `form:"keyword"`    // Tìm theo IMEI hoặc Tên máy
	Status    string `form:"status"`     // Filter trạng thái
	StartDate string `form:"start_date"` // YYYY-MM-DD
	EndDate   string `form:"end_date"`   // YYYY-MM-DD
}
