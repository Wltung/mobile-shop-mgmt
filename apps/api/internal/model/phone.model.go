package model

import (
	"time"
)

type Phone struct {
	ID        int     `db:"id" json:"id"`
	IMEI      string  `db:"imei" json:"imei"`
	ModelName string  `db:"model_name" json:"model_name"`
	Details   JSONMap `db:"details" json:"details"`
	Status    string  `db:"status" json:"status"`

	PurchasePrice int64  `db:"purchase_price" json:"purchase_price"`
	SalePrice     *int64 `db:"sale_price" json:"sale_price"`

	PurchaseDate *time.Time `db:"purchase_date" json:"purchase_date"`
	SaleDate     *time.Time `db:"sale_date" json:"sale_date"`
	Note         *string    `db:"note" json:"note"`

	CreatedAt time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt time.Time  `db:"updated_at" json:"updated_at"`
	DeletedAt *time.Time `db:"deleted_at" json:"deleted_at"`

	ImportBy     *int   `db:"import_by" json:"import_by"`
	ImporterName string `db:"importer_name" json:"importer_name"`

	// 3 cột lưu trực tiếp thông tin người bán (nguồn gốc máy)
	SellerName     *string `db:"seller_name" json:"seller_name"`
	SellerPhone    *string `db:"seller_phone" json:"seller_phone"`
	SellerIDNumber *string `db:"seller_id_number" json:"seller_id"`
	PaymentMethod  *string `db:"payment_method" json:"payment_method,omitempty"`

	// Thông tin lấy từ bảng Invoices (Hoá đơn bán)
	BuyerName     *string `db:"buyer_name" json:"buyer_name,omitempty"`
	InvoiceCode   *string `db:"invoice_code" json:"invoice_code"`
	InvoiceID     *int    `db:"invoice_id" json:"invoice_id"`
	InvoiceStatus *string `db:"invoice_status" json:"invoice_status,omitempty"`
}

type PhoneInput struct {
	IMEI          string  `json:"imei" binding:"required"`
	ModelName     string  `json:"model_name" binding:"required"`
	Details       JSONMap `json:"details"`
	PurchasePrice int64   `json:"purchase_price" binding:"required"`
	SalePrice     int64   `json:"sale_price"`
	Note          string  `json:"note"`

	SellerName  string `json:"seller_name"`
	SellerPhone string `json:"seller_phone"`
	SellerID    string `json:"seller_id"`
}

type PhoneFilter struct {
	Page          int    `form:"page"`
	Limit         int    `form:"limit"`
	Keyword       string `form:"keyword"`
	Status        string `form:"status"`
	StartDate     string `form:"start_date"`
	EndDate       string `form:"end_date"`
	HasSalePrice  bool   `form:"has_sale_price"`
	InvoiceStatus string `form:"invoice_status"`
}

type PhoneUpdateInput struct {
	IMEI          *string  `json:"imei"`
	ModelName     *string  `json:"model_name"`
	Details       *JSONMap `json:"details"`
	PurchasePrice *int64   `json:"purchase_price"`
	PurchaseDate  *string  `json:"purchase_date"`
	SalePrice     *int64   `json:"sale_price"`
	Note          *string  `json:"note"`

	SellerName    *string `json:"seller_name"`
	SellerPhone   *string `json:"seller_phone"`
	SellerID      *string `json:"seller_id"`
	PaymentMethod *string `json:"payment_method"`
}
