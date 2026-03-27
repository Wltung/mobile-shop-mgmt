package model

import "time"

// 1. Entity map với DB
type Warranty struct {
	ID            int        `db:"id" json:"id"`
	WarrantyCode  *string    `db:"warranty_code" json:"warranty_code"`
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
	DeletedAt     *time.Time `db:"deleted_at" json:"deleted_at"`
}

// 2. Cấu trúc JSON cho cột description
type WarrantyDescription struct {
	Condition string `json:"condition"` // Tình trạng máy khi nhận
	Fault     string `json:"fault"`     // Lỗi khách thông báo
	PartName  string `json:"part_name"`
}

// 3. Cấu trúc JSON cho cột technical_note
type WarrantyTechnicalNote struct {
	SpecialNote       string `json:"special_note"`       // Ghi chú đặc biệt
	WarrantyCondition string `json:"warranty_condition"` // Điều kiện bảo hành
}

// 4. Input tạo mới
type CreateWarrantyInput struct {
	Type       string `json:"type" binding:"required"`
	PhoneID    *int   `json:"phone_id"`
	InvoiceID  *int   `json:"invoice_id" binding:"required"` // Bắt buộc phải có
	DeviceName string `json:"device_name" binding:"required"`
	IMEI       string `json:"imei"`

	Condition         string `json:"condition"`
	Fault             string `json:"fault" binding:"required"`
	PartName          string `json:"part_name"`
	SpecialNote       string `json:"special_note"`
	WarrantyCondition string `json:"warranty_condition"`
	Cost              int64  `json:"cost"`

	StartDate *time.Time `json:"start_date"`
	EndDate   *time.Time `json:"end_date"`
}

// 5. Input cập nhật
type UpdateWarrantyInput struct {
	Status *string `json:"status" binding:"omitempty,oneof=RECEIVED PROCESSING DONE CANCELLED"`
	Cost   *int64  `json:"cost" binding:"omitempty,min=0"`

	// Các field cập nhật cho JSON Description
	Condition *string `json:"condition"`
	Fault     *string `json:"fault"`

	// Các field cập nhật cho JSON Technical Note
	SpecialNote       *string `json:"special_note"`
	WarrantyCondition *string `json:"warranty_condition"`

	// Các field ẩn dùng nội bộ ở service để truyền xuống Repo
	Description   *string `json:"-"`
	TechnicalNote *string `json:"-"`
}

type WarrantyFilter struct {
	Page      int    `form:"page"`
	Limit     int    `form:"limit"`
	Keyword   string `form:"keyword"`
	Status    string `form:"status"`
	StartDate string `form:"start_date"`
	EndDate   string `form:"end_date"`
}

// 6. Item trả về cho danh sách (Đã parse sẵn 2 cục JSON cho FE)
type WarrantyListItem struct {
	Warranty
	Type              *string                `db:"type" json:"type"`
	InvoiceCode       *string                `db:"invoice_code" json:"invoice_code"`
	CustomerName      *string                `db:"customer_name" json:"customer_name"`           // TỪ JOIN
	CustomerPhone     *string                `db:"customer_phone" json:"customer_phone"`         // TỪ JOIN
	CustomerIDNumber  *string                `db:"customer_id_number" json:"customer_id_number"` // TỪ JOIN
	WarrantyMonths    *int                   `db:"warranty_months" json:"warranty_months"`
	DescriptionJSON   *WarrantyDescription   `json:"description_json,omitempty"`
	TechnicalNoteJSON *WarrantyTechnicalNote `json:"technical_note_json,omitempty"`
}

// 7. Struct cho Dropdown tìm kiếm
type WarrantySearchItem struct {
	InvoiceID        int        `db:"invoice_id" json:"invoice_id"`
	InvoiceCode      string     `db:"invoice_code" json:"invoice_code"`
	PhoneID          *int       `db:"phone_id" json:"phone_id"`
	DeviceName       string     `db:"device_name" json:"device_name"`
	IMEI             *string    `db:"imei" json:"imei"`
	CustomerName     *string    `db:"customer_name" json:"customer_name"`
	CustomerPhone    *string    `db:"customer_phone" json:"customer_phone"`
	CustomerIDNumber *string    `db:"customer_id_number" json:"customer_id_number"`
	PartName         *string    `db:"part_name" json:"part_name"`
	ItemType         *string    `db:"item_type" json:"item_type"`
	WarrantyExpiry   *time.Time `db:"warranty_expiry" json:"warranty_expiry"`
	WarrantyMonths   int        `db:"warranty_months" json:"warranty_months"`
}
