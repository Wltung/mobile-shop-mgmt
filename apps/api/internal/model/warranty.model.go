package model

import "time"

// Entity map với DB
type Warranty struct {
	ID           int     `db:"id" json:"id"`
	WarrantyCode *string `db:"warranty_code" json:"warranty_code"`

	// Thông tin khách hàng dính liền với phiếu bảo hành
	CustomerName  *string `db:"customer_name" json:"customer_name"`
	CustomerPhone *string `db:"customer_phone" json:"customer_phone"`

	PhoneID       *int       `db:"phone_id" json:"phone_id"`
	InvoiceID     *int       `db:"invoice_id" json:"invoice_id"`
	DeviceName    *string    `db:"device_name" json:"device_name"`
	IMEI          *string    `db:"imei" json:"imei"`
	Description   *string    `db:"description" json:"description"`
	TechnicalNote *string    `db:"technical_note" json:"technical_note"`
	Status        string     `db:"status" json:"status"`
	Cost          int64      `db:"cost" json:"cost"`
	StartDate     *time.Time `db:"start_date" json:"start_date"`
	EndDate       *time.Time `db:"end_date" json:"end_date"`
	CreatedAt     time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt     *time.Time `db:"updated_at" json:"updated_at"`
}

// Input tạo mới
type CreateWarrantyInput struct {
	Type             string `json:"type" binding:"required"`
	CustomerName     string `json:"customer_name" binding:"required"`
	CustomerPhone    string `json:"customer_phone"`
	CustomerIDNumber string `json:"customer_id_number"` // Nếu FE gửi lên thì cứ hứng, không bắt buộc

	PhoneID       *int       `json:"phone_id"`
	InvoiceID     *int       `json:"invoice_id"`
	DeviceName    string     `json:"device_name" binding:"required"`
	IMEI          string     `json:"imei"`
	Description   string     `json:"description" binding:"required"`
	TechnicalNote string     `json:"technical_note"`
	StartDate     *time.Time `json:"start_date"`
	EndDate       *time.Time `json:"end_date"`
}

type UpdateWarrantyInput struct {
	Status        *string `json:"status" binding:"omitempty,oneof=RECEIVED CHECKING REPAIRING WAITING_CUSTOMER COMPLETED DELIVERED CANCELLED"`
	Cost          *int64  `json:"cost" binding:"omitempty,min=0"`
	TechnicalNote *string `json:"technical_note"`
	Description   *string `json:"description"`
}

type WarrantyFilter struct {
	Page      int    `form:"page"`
	Limit     int    `form:"limit"`
	Keyword   string `form:"keyword"`
	Status    string `form:"status"`
	StartDate string `form:"start_date"`
	EndDate   string `form:"end_date"`
}

// Item trả về cho danh sách
type WarrantyListItem struct {
	Warranty
	Type        *string `db:"type" json:"type"` // Lấy từ bảng invoices
	InvoiceCode *string `db:"invoice_code" json:"invoice_code"`
}

// Struct trả về cho Dropdown tìm kiếm bảo hành
type WarrantySearchItem struct {
	InvoiceID      int        `db:"invoice_id" json:"invoice_id"`
	InvoiceCode    string     `db:"invoice_code" json:"invoice_code"`
	PhoneID        *int       `db:"phone_id" json:"phone_id"`
	DeviceName     string     `db:"device_name" json:"device_name"`
	IMEI           *string    `db:"imei" json:"imei"`
	CustomerName   *string    `db:"customer_name" json:"customer_name"`
	CustomerPhone  *string    `db:"customer_phone" json:"customer_phone"`
	WarrantyExpiry *time.Time `db:"warranty_expiry" json:"warranty_expiry"`
	WarrantyMonths int        `db:"warranty_months" json:"warranty_months"`
}
