package repository

import (
	"api/internal/model"

	"github.com/jmoiron/sqlx"
)

type RepairRepo struct {
	DB *sqlx.DB
}

func NewRepairRepo(db *sqlx.DB) *RepairRepo {
	return &RepairRepo{DB: db}
}

// Create: Tạo phiếu nhận sửa máy
func (r *RepairRepo) Create(repair model.Repair) (int, error) {
	query := `
		INSERT INTO repairs (
			phone_id, customer_id, repair_type, 
			description, part_cost, repair_price, 
			device_password, created_at
		) VALUES (
			:phone_id, :customer_id, :repair_type, 
			:description, :part_cost, :repair_price, 
			:device_password, NOW()
		)
	`
	res, err := r.DB.NamedExec(query, repair)
	if err != nil {
		return 0, err
	}
	id, err := res.LastInsertId()
	return int(id), err
}

// Update: Cập nhật thông tin phiếu sửa chữa
func (r *RepairRepo) Update(id int, input model.UpdateRepairInput) error {
	query := `
		UPDATE repairs 
		SET 
			description = COALESCE(?, description),
			device_password = COALESCE(?, device_password),
			part_cost = COALESCE(?, part_cost),
			repair_price = COALESCE(?, repair_price),
			repair_type = COALESCE(?, repair_type),
			status = COALESCE(?, status),             -- Thêm dòng này
			updated_at = NOW()
		WHERE id = ?
	`
	_, err := r.DB.Exec(query,
		input.Description,
		input.DevicePassword,
		input.PartCost,
		input.RepairPrice,
		input.RepairType,
		input.Status,
		id,
	)
	return err
}

// GetByID: Lấy chi tiết phiếu sửa
func (r *RepairRepo) GetByID(id int) (*model.RepairListItem, error) {
	var item model.RepairListItem
	query := `
		SELECT r.*, c.name as customer_name, c.phone as customer_phone, p.model_name as phone_model
		FROM repairs r
		LEFT JOIN customers c ON r.customer_id = c.id
		LEFT JOIN phones p ON r.phone_id = p.id
		WHERE r.id = ? LIMIT 1
	`
	err := r.DB.Get(&item, query, id)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

// GetAll: Lấy danh sách phiếu sửa chữa (có phân trang và filter)
func (r *RepairRepo) GetAll(filter model.RepairFilter) ([]model.RepairListItem, int, error) {
	offset := (filter.Page - 1) * filter.Limit
	var items []model.RepairListItem
	var total int

	// Base query JOIN với customers và phones
	baseQuery := `
		FROM repairs r
		LEFT JOIN customers c ON r.customer_id = c.id
		LEFT JOIN phones p ON r.phone_id = p.id
		WHERE 1=1
	`
	var args []interface{}

	// Xử lý Filters
	if filter.Keyword != "" {
		baseQuery += ` AND (c.name LIKE ? OR c.phone LIKE ? OR r.description LIKE ?)`
		kw := "%" + filter.Keyword + "%"
		args = append(args, kw, kw, kw)
	}
	if filter.Status != "" && filter.Status != "ALL" {
		baseQuery += ` AND r.status = ?`
		args = append(args, filter.Status)
	}
	if filter.StartDate != "" && filter.EndDate != "" {
		baseQuery += ` AND DATE(r.created_at) >= ? AND DATE(r.created_at) <= ?`
		args = append(args, filter.StartDate, filter.EndDate)
	}

	// 1. Đếm tổng số bản ghi (để phân trang)
	countQuery := `SELECT COUNT(*) ` + baseQuery
	if err := r.DB.Get(&total, countQuery, args...); err != nil {
		return nil, 0, err
	}

	// 2. Lấy dữ liệu
	selectQuery := `
		SELECT 
			r.*, 
			c.name as customer_name, 
			c.phone as customer_phone,
			p.model_name as phone_model
	` + baseQuery + ` ORDER BY r.created_at DESC LIMIT ? OFFSET ?`

	args = append(args, filter.Limit, offset)

	if err := r.DB.Select(&items, selectQuery, args...); err != nil {
		return nil, 0, err
	}

	return items, total, nil
}

// GetStats: Lấy số liệu thống kê cho trang sửa chữa
func (r *RepairRepo) GetStats() (int, int, error) {
	var repairingCount int
	var completedTodayCount int

	// Đếm máy Đang sửa
	err := r.DB.Get(&repairingCount, `SELECT COUNT(*) FROM repairs WHERE status = 'REPAIRING'`)
	if err != nil {
		return 0, 0, err
	}

	// Đếm máy Hoàn thành hôm nay
	err = r.DB.Get(&completedTodayCount, `SELECT COUNT(*) FROM repairs WHERE status = 'COMPLETED' AND DATE(updated_at) = CURDATE()`)
	if err != nil {
		return 0, 0, err
	}

	return repairingCount, completedTodayCount, nil
}
