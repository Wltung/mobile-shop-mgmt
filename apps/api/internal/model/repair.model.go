package model

import "time"

// Repair Entity map với Database
type Repair struct {
	ID      int  `db:"id" json:"id"`
	PhoneID *int `db:"phone_id" json:"phone_id"`

	// Thay thế CustomerID bằng các trường Text
	CustomerName  *string `db:"customer_name" json:"customer_name"`
	CustomerPhone *string `db:"customer_phone" json:"customer_phone"`

	RepairCategory string     `db:"repair_category" json:"repair_category"`
	Description    *string    `db:"description" json:"description"`
	PartCost       *int64     `db:"part_cost" json:"part_cost"`
	RepairPrice    *int64     `db:"repair_price" json:"repair_price"`
	DevicePassword *string    `db:"device_password" json:"device_password"`
	Status         string     `db:"status" json:"status"`
	InvoiceID      *int       `db:"invoice_id" json:"invoice_id"`
	CreatedAt      time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt      *time.Time `db:"updated_at" json:"updated_at"`
}

// Input để tạo Phiếu sửa chữa mới
type CreateRepairInput struct {
	CustomerName     string `json:"customer_name" binding:"required"`
	CustomerPhone    string `json:"customer_phone"`
	CustomerIDNumber string `json:"customer_id_number"`

	PhoneID        *int   `json:"phone_id"`
	DeviceName     string `json:"device_name"`
	DevicePassword string `json:"device_password"`

	RepairCategory string `json:"repair_category" binding:"required,oneof=SHOP_DEVICE_REPAIR CUSTOMER_DEVICE_REPAIR"`
	Description    string `json:"description"`
	PartCost       *int64 `json:"part_cost" binding:"omitempty,min=0"`
	RepairPrice    *int64 `json:"repair_price" binding:"omitempty,min=0"`
}

// Input để cập nhật Phiếu sửa chữa
type UpdateRepairInput struct {
	Description    *string `json:"description"`
	DevicePassword *string `json:"device_password"`
	PartCost       *int64  `json:"part_cost" binding:"omitempty,min=0"`
	RepairPrice    *int64  `json:"repair_price" binding:"omitempty,min=0"`
	RepairCategory *string `json:"repair_category" binding:"omitempty,oneof=SHOP_DEVICE_REPAIR CUSTOMER_DEVICE_REPAIR"`
	Status         *string `json:"status" binding:"omitempty,oneof=PENDING REPAIRING WAITING_CUSTOMER COMPLETED DELIVERED"`
	InvoiceID      *int    `json:"invoice_id"`
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
	Repair // Nhúng toàn bộ field của Repair (bao gồm cả CustomerName, CustomerPhone)

	PhoneModel *string `db:"phone_model" json:"-"` // Giấu đi, FE không cần

	// Field tự tính toán trong Service
	DeviceName string `json:"device_name"`
}
