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
			updated_at = NOW()
		WHERE id = ?
	`
	_, err := r.DB.Exec(query,
		input.Description,
		input.DevicePassword,
		input.PartCost,
		input.RepairPrice,
		input.RepairType,
		id,
	)
	return err
}

// GetByID: Lấy chi tiết phiếu sửa
func (r *RepairRepo) GetByID(id int) (*model.Repair, error) {
	var repair model.Repair
	query := `SELECT * FROM repairs WHERE id = ? LIMIT 1`
	err := r.DB.Get(&repair, query, id)
	if err != nil {
		return nil, err
	}
	return &repair, nil
}
