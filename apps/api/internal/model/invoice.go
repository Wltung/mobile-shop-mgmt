package model

import "time"

// Enum cho Type và Status
const (
	InvoiceTypeImport = "IMPORT"
	InvoiceTypeSale   = "SALE"
	InvoiceTypeRepair = "REPAIR"

	InvoiceStatusDraft     = "DRAFT"
	InvoiceStatusPaid      = "PAID"
	InvoiceStatusCancelled = "CANCELLED"

	ItemTypePhone   = "PHONE"
	ItemTypePart    = "PART"
	ItemTypeService = "SERVICE"
)

// 1. Entity map với Database
type Invoice struct {
	ID            int        `db:"id" json:"id"`
	InvoiceCode   string     `db:"invoice_code" json:"invoice_code"`
	Type          string     `db:"type" json:"type"`     // IMPORT, SALE, REPAIR
	Status        string     `db:"status" json:"status"` // DRAFT, PAID, CANCELLED
	CustomerID    *int       `db:"customer_id" json:"customer_id"`
	PaymentMethod string     `db:"payment_method" json:"payment_method"`
	TotalAmount   int64      `db:"total_amount" json:"total_amount"`
	CreatedBy     int        `db:"created_by" json:"created_by"`
	CreatedAt     time.Time  `db:"created_at" json:"created_at"`
	Note          string     `db:"note" json:"note"`
	UpdatedAt     *time.Time `db:"updated_at" json:"updated_at"`

	// Fields hiển thị (JOIN)
	CustomerName     string        `db:"customer_name" json:"customer_name,omitempty"`
	CreatorName      string        `db:"creator_name" json:"creator_name,omitempty"`
	CustomerPhone    *string       `db:"customer_phone" json:"customer_phone,omitempty"`
	CustomerIDNumber *string       `db:"customer_id_number" json:"customer_id_number,omitempty"`
	Items            []InvoiceItem `json:"items,omitempty"` // Để load chi tiết
	RepairID         *int          `db:"repair_id" json:"repair_id,omitempty"`
}

type InvoiceItem struct {
	ID             int        `db:"id" json:"id"`
	InvoiceID      int        `db:"invoice_id" json:"invoice_id"`
	ItemType       string     `db:"item_type" json:"item_type"` // PHONE, PART, SERVICE
	PhoneID        *int       `db:"phone_id" json:"phone_id"`
	Description    string     `db:"description" json:"description"`
	Quantity       int        `db:"quantity" json:"quantity"`
	UnitPrice      int64      `db:"unit_price" json:"unit_price"`
	Amount         int64      `db:"amount" json:"amount"`
	WarrantyMonths int        `db:"warranty_months" json:"warranty_months"`
	WarrantyExpiry *time.Time `db:"warranty_expiry" json:"warranty_expiry"`
	UpdatedAt      *time.Time `db:"updated_at" json:"updated_at"`

	IMEI         *string  `db:"imei" json:"imei,omitempty"`
	PhoneDetails *JSONMap `db:"phone_details" json:"phone_details,omitempty"`
}

// 2. Input DTO (Dữ liệu FE gửi lên để tạo hóa đơn)
type CreateInvoiceInput struct {
	Type             string            `json:"type" binding:"required,oneof=IMPORT SALE REPAIR"`
	Status           string            `json:"status"` // Default
	PaymentMethod    string            `json:"payment_method"`
	CustomerID       *int              `json:"customer_id"`
	CustomerName     string            `json:"customer_name"`
	CustomerPhone    string            `json:"customer_phone"`
	CustomerIDNumber string            `json:"customer_id_number"`
	Note             string            `json:"note"`
	Items            []CreateItemInput `json:"items" binding:"required,min=1"`
}

type CreateItemInput struct {
	ItemType       string `json:"item_type" binding:"required,oneof=PHONE PART SERVICE"`
	PhoneID        *int   `json:"phone_id"` // Bắt buộc nếu ItemType là PHONE
	Description    string `json:"description"`
	Quantity       int    `json:"quantity" binding:"min=1"`
	UnitPrice      int64  `json:"unit_price" binding:"min=0"`
	WarrantyMonths int    `json:"warranty_months"`
}

type UpdateInvoiceInput struct {
	CustomerName     *string `json:"customer_name"`
	CustomerPhone    *string `json:"customer_phone"`
	CustomerIDNumber *string `json:"customer_id_number"` // Nếu cần sau này

	Status        *string `json:"payment_status"`
	PaymentMethod *string `json:"payment_method"`
	Note          *string `json:"note"`
	CreatedAt     *string `json:"created_at"`

	PhoneID         *int   `json:"phone_id"`
	ActualSalePrice string `json:"actual_sale_price"` // FE gửi string, cần convert
	Warranty        string `json:"warranty"`
}

// Struct dùng để map query params từ request GET
type InvoiceFilter struct {
	Page      int    `form:"page"`
	Limit     int    `form:"limit"`
	Keyword   string `form:"keyword"`
	Type      string `form:"type"`
	Status    string `form:"status"`
	StartDate string `form:"start_date"`
	EndDate   string `form:"end_date"`
}

// Struct dùng để trả về thống kê
type InvoiceStats struct {
	TotalRevenue int64 `json:"totalRevenue"`
	TotalCount   int   `json:"totalCount"`
}
