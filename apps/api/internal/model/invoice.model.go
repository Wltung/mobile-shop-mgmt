package model

import "time"

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
	ID            int    `db:"id" json:"id"`
	TenantID      int    `db:"tenant_id" json:"-"`
	InvoiceCode   string `db:"invoice_code" json:"invoice_code"`
	Type          string `db:"type" json:"type"`
	Status        string `db:"status" json:"status"`
	PaymentMethod string `db:"payment_method" json:"payment_method"`

	// Thay thế CustomerID bằng 3 cột lưu trực tiếp
	CustomerName     *string `db:"customer_name" json:"customer_name"`
	CustomerPhone    *string `db:"customer_phone" json:"customer_phone"`
	CustomerIDNumber *string `db:"customer_id_number" json:"customer_id_number"`

	TotalAmount int64      `db:"total_amount" json:"total_amount"`
	Discount    int64      `db:"discount" json:"discount"`
	CreatedBy   int        `db:"created_by" json:"created_by"`
	CreatedAt   time.Time  `db:"created_at" json:"created_at"`
	Note        *string    `db:"note" json:"note"`
	UpdatedAt   *time.Time `db:"updated_at" json:"updated_at"`
	DeletedAt   *time.Time `db:"deleted_at" json:"deleted_at,omitempty"`

	// Fields hiển thị thêm (JOIN)
	CreatorName string        `db:"creator_name" json:"creator_name,omitempty"`
	Items       []InvoiceItem `json:"items,omitempty"`
	RepairID    *int          `db:"repair_id" json:"repair_id,omitempty"`
	ModelName   *string       `db:"model_name" json:"model_name,omitempty"`
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
	WarrantyDays   int        `db:"-" json:"-"`
	WarrantyExpiry *time.Time `db:"warranty_expiry" json:"warranty_expiry"`
	UpdatedAt      *time.Time `db:"updated_at" json:"updated_at"`

	IMEI         *string  `db:"imei" json:"imei,omitempty"`
	PhoneDetails *JSONMap `db:"phone_details" json:"phone_details,omitempty"`
}

// 2. Input DTO (Dữ liệu FE gửi lên)
type CreateInvoiceInput struct {
	Type             string            `json:"type" binding:"required,oneof=IMPORT SALE REPAIR"`
	Status           string            `json:"status"` // Default
	PaymentMethod    string            `json:"payment_method"`
	CustomerName     string            `json:"customer_name"`
	CustomerPhone    string            `json:"customer_phone"`
	CustomerIDNumber string            `json:"customer_id_number"`
	Note             string            `json:"note"`
	Discount         int64             `json:"discount"`
	Items            []CreateItemInput `json:"items" binding:"required,min=1"`
}

type CreateItemInput struct {
	ItemType       string `json:"item_type" binding:"required,oneof=PHONE PART SERVICE"`
	PhoneID        *int   `json:"phone_id"` // Bắt buộc nếu ItemType là PHONE
	Description    string `json:"description"`
	Quantity       int    `json:"quantity" binding:"min=1"`
	UnitPrice      int64  `json:"unit_price" binding:"min=0"`
	WarrantyMonths int    `json:"warranty_months"`
	WarrantyDays   int    `json:"warranty_days"`
}

type UpdateInvoiceInput struct {
	CustomerName     *string `json:"customer_name"`
	CustomerPhone    *string `json:"customer_phone"`
	CustomerIDNumber *string `json:"customer_id_number"`

	Status        *string `json:"payment_status"`
	PaymentMethod *string `json:"payment_method"`
	Note          *string `json:"note"`
	CreatedAt     *string `json:"created_at"`
	Discount      *int64  `json:"discount"`

	PhoneID         *int   `json:"phone_id"`
	ActualSalePrice string `json:"actual_sale_price"` // FE gửi string, cần convert
	Warranty        string `json:"warranty"`
}

type InvoiceFilter struct {
	Page      int    `form:"page"`
	Limit     int    `form:"limit"`
	Keyword   string `form:"keyword"`
	Type      string `form:"type"`
	Status    string `form:"status"`
	StartDate string `form:"start_date"`
	EndDate   string `form:"end_date"`
}

type InvoiceStats struct {
	TotalRevenue int64 `json:"totalRevenue"`
	TotalCount   int   `json:"totalCount"`
}
