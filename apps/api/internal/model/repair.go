package model

import "time"

// Repair Entity map với Database
type Repair struct {
	ID             int        `db:"id" json:"id"`
	PhoneID        *int       `db:"phone_id" json:"phone_id"`               // Có thể NULL nếu là máy khách ngoài mang tới
	CustomerID     *int       `db:"customer_id" json:"customer_id"`         // ID khách hàng mang máy đến
	RepairType     string     `db:"repair_type" json:"repair_type"`         // NORMAL hoặc WARRANTY
	Description    *string    `db:"description" json:"description"`         // Tình trạng máy, lỗi...
	PartCost       *int64     `db:"part_cost" json:"part_cost"`             // Tiền linh kiện dự kiến
	RepairPrice    *int64     `db:"repair_price" json:"repair_price"`       // Tiền công + tổng báo giá dự kiến
	DevicePassword *string    `db:"device_password" json:"device_password"` // Mật khẩu máy
	CreatedAt      time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt      *time.Time `db:"updated_at" json:"updated_at"`
}

// Input để tạo Phiếu sửa chữa mới
type CreateRepairInput struct {
	// Thông tin khách hàng (Bắt buộc phải có Tên để liên hệ trả máy)
	CustomerName     string `json:"customer_name" binding:"required"`
	CustomerPhone    string `json:"customer_phone"`
	CustomerIDNumber string `json:"customer_id_number"`

	// Thông tin thiết bị
	PhoneID        *int   `json:"phone_id"`        // Trỏ ID máy nếu máy từng mua ở cửa hàng
	DeviceName     string `json:"device_name"`     // Tên máy (nếu PhoneID null - khách ngoài)
	DevicePassword string `json:"device_password"` // Mật khẩu màn hình

	// Chi tiết sửa chữa
	RepairType  string `json:"repair_type" binding:"required,oneof=NORMAL WARRANTY"`
	Description string `json:"description"` // Mô tả lỗi báo khách
	PartCost    *int64 `json:"part_cost" binding:"omitempty,min=0"`
	RepairPrice *int64 `json:"repair_price" binding:"omitempty,min=0"`
}

// Input để cập nhật Phiếu sửa chữa (Thêm chi phí thực tế, đổi tình trạng)
type UpdateRepairInput struct {
	Description    *string `json:"description"`
	DevicePassword *string `json:"device_password"`
	PartCost       *int64  `json:"part_cost" binding:"omitempty,min=0"`
	RepairPrice    *int64  `json:"repair_price" binding:"omitempty,min=0"`
	RepairType     *string `json:"repair_type" binding:"omitempty,oneof=NORMAL WARRANTY"`
}
