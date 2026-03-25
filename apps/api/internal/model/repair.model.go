package model

import "time"

// Repair Entity map với Database
type Repair struct {
	ID      int  `db:"id" json:"id"`
	PhoneID *int `db:"phone_id" json:"phone_id"`

	CustomerName  *string `db:"customer_name" json:"customer_name"`
	CustomerPhone *string `db:"customer_phone" json:"customer_phone"`

	RepairCategory string     `db:"repair_category" json:"repair_category"`
	Description    *string    `db:"description" json:"description"` // Sẽ lưu JSON string
	PartCost       *int64     `db:"part_cost" json:"part_cost"`
	RepairPrice    *int64     `db:"repair_price" json:"repair_price"`
	DevicePassword *string    `db:"device_password" json:"device_password"`
	Status         string     `db:"status" json:"status"`
	InvoiceID      *int       `db:"invoice_id" json:"invoice_id"`
	CreatedAt      time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt      *time.Time `db:"updated_at" json:"updated_at"`
}

type RepairPart struct {
	Name     string `json:"name"`
	Price    int64  `json:"price"`
	Warranty int    `json:"warranty"`
}

// Cấu trúc chuẩn của cục JSON trong cột description
type RepairDescription struct {
	DeviceName         string       `json:"device_name"`
	IMEI               string       `json:"imei"`
	Color              string       `json:"color"`
	Fault              string       `json:"fault"`
	Accessories        string       `json:"accessories"`
	IsPromisedReturn   bool         `json:"is_promised_return"`
	PromisedReturnDate *string      `json:"promised_return_date"`
	TechnicalNote      string       `json:"technical_note"`
	Parts              []RepairPart `json:"parts"`
	Discount           int64        `json:"discount"`
	HasLaborWarranty   bool         `json:"has_labor_warranty"`
}

// Input để tạo Phiếu sửa chữa mới
type CreateRepairInput struct {
	CustomerName     string `json:"customer_name"`
	CustomerPhone    string `json:"customer_phone"`
	CustomerIDNumber string `json:"customer_id_number"`

	PhoneID        *int   `json:"phone_id"`
	DeviceName     string `json:"device_name"` // Dành cho máy khách vãng lai
	IMEI           string `json:"imei"`        // Dành cho máy khách vãng lai
	Color          string `json:"color"`       // Dành cho máy khách vãng lai
	DevicePassword string `json:"device_password"`

	RepairCategory string `json:"repair_category" binding:"required,oneof=SHOP_DEVICE_REPAIR CUSTOMER_DEVICE_REPAIR"`

	// Các field phục vụ tạo Description JSON
	Fault              string  `json:"fault"`
	Accessories        string  `json:"accessories"`
	PromisedReturnDate *string `json:"promised_return_date"`
	TechnicalNote      string  `json:"technical_note"`

	Parts            []RepairPart `json:"parts"`
	Discount         int64        `json:"discount"`
	HasLaborWarranty bool         `json:"has_labor_warranty"`

	PartCost    *int64 `json:"part_cost" binding:"omitempty,min=0"`
	RepairPrice *int64 `json:"repair_price" binding:"omitempty,min=0"`
}

// Input để cập nhật Phiếu sửa chữa
type UpdateRepairInput struct {
	CustomerName  *string `json:"customer_name"`
	CustomerPhone *string `json:"customer_phone"`

	// FE gửi lên các field rời rạc, BE sẽ tự gom lại thành JSON
	Fault              *string `json:"fault"`
	Accessories        *string `json:"accessories"`
	PromisedReturnDate *string `json:"promised_return_date"`
	TechnicalNote      *string `json:"technical_note"`

	Description      *string      `json:"-"` // Dùng nội bộ trong Go
	DevicePassword   *string      `json:"device_password"`
	PartCost         *int64       `json:"part_cost" binding:"omitempty,min=0"`
	RepairPrice      *int64       `json:"repair_price" binding:"omitempty,min=0"`
	RepairCategory   *string      `json:"repair_category" binding:"omitempty,oneof=SHOP_DEVICE_REPAIR CUSTOMER_DEVICE_REPAIR"`
	Status           *string      `json:"status" binding:"omitempty,oneof=PENDING REPAIRING WAITING_CUSTOMER COMPLETED DELIVERED"`
	InvoiceID        *int         `json:"invoice_id"`
	Parts            []RepairPart `json:"parts"`
	Discount         *int64       `json:"discount"`
	HasLaborWarranty *bool        `json:"has_labor_warranty"`
}

type RepairFilter struct {
	Page      int    `form:"page"`
	Limit     int    `form:"limit"`
	Keyword   string `form:"keyword"`
	Status    string `form:"status"`
	StartDate string `form:"start_date"`
	EndDate   string `form:"end_date"`
}

type RepairListItem struct {
	Repair
	PhoneModel *string `db:"phone_model" json:"-"`

	DeviceName      string             `json:"device_name"`
	DescriptionJSON *RepairDescription `json:"description_json,omitempty"` // Trả thẳng cục Object JSON cho FE dùng
}
