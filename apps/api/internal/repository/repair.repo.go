package repository

import (
	"api/internal/model"
	"encoding/json"

	"github.com/jmoiron/sqlx"
)

type RepairRepo struct {
	DB *sqlx.DB
}

func NewRepairRepo(db *sqlx.DB) *RepairRepo {
	return &RepairRepo{DB: db}
}

func (r *RepairRepo) Create(repair model.Repair, userID int, tenantID int) (int, error) {
	repair.UserID = userID
	repair.TenantID = tenantID

	query := `
		INSERT INTO repairs (
			tenant_id, phone_id, customer_name, customer_phone, repair_category, 
			description, part_cost, repair_price, 
			device_password, created_at, user_id
		) VALUES (
			:tenant_id, :phone_id, :customer_name, :customer_phone, :repair_category, 
			:description, :part_cost, :repair_price, 
			:device_password, NOW(), :user_id
		)
	`
	res, err := r.DB.NamedExec(query, repair)
	if err != nil {
		return 0, err
	}
	id, err := res.LastInsertId()
	return int(id), err
}

func (r *RepairRepo) Update(id int, input model.UpdateRepairInput, tenantID int) error {
	query := `
		UPDATE repairs 
		SET 
			customer_name = COALESCE(?, customer_name),
			customer_phone = COALESCE(?, customer_phone),
			description = COALESCE(?, description),
			device_password = COALESCE(?, device_password),
			part_cost = COALESCE(?, part_cost),
			repair_price = COALESCE(?, repair_price),
			repair_category = COALESCE(?, repair_category),
			status = COALESCE(?, status),
			invoice_id = COALESCE(?, invoice_id),
			updated_at = NOW()
		WHERE id = ? AND tenant_id = ?
	`
	_, err := r.DB.Exec(query,
		input.CustomerName, input.CustomerPhone, input.Description,
		input.DevicePassword, input.PartCost, input.RepairPrice,
		input.RepairCategory, input.Status, input.InvoiceID,
		id, tenantID,
	)
	return err
}

func (r *RepairRepo) GetByID(id int, tenantID int) (*model.RepairListItem, error) {
	var item model.RepairListItem
	query := `
		SELECT r.*, p.model_name as phone_model
		FROM repairs r
		LEFT JOIN phones p ON r.phone_id = p.id
		WHERE r.id = ? AND r.tenant_id = ? LIMIT 1
	`
	err := r.DB.Get(&item, query, id, tenantID)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *RepairRepo) GetAll(filter model.RepairFilter, tenantID int) ([]model.RepairListItem, int, error) {
	offset := (filter.Page - 1) * filter.Limit
	var items []model.RepairListItem
	var total int

	baseQuery := `
		FROM repairs r
		LEFT JOIN phones p ON r.phone_id = p.id
		WHERE r.deleted_at IS NULL AND r.tenant_id = ?
	`
	var args []interface{}
	args = append(args, tenantID)

	if filter.Keyword != "" {
		baseQuery += ` AND (r.customer_name LIKE ? OR r.customer_phone LIKE ? OR r.description LIKE ?)`
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

	countQuery := `SELECT COUNT(*) ` + baseQuery
	if err := r.DB.Get(&total, countQuery, args...); err != nil {
		return nil, 0, err
	}

	selectQuery := `SELECT r.*, p.model_name as phone_model ` + baseQuery + ` ORDER BY r.created_at DESC LIMIT ? OFFSET ?`
	args = append(args, filter.Limit, offset)

	if err := r.DB.Select(&items, selectQuery, args...); err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func (r *RepairRepo) GetStats(tenantID int) (int, int, error) {
	var repairingCount, completedTodayCount int

	err := r.DB.Get(&repairingCount, `SELECT COUNT(*) FROM repairs WHERE deleted_at IS NULL AND tenant_id = ? AND status IN ('PENDING', 'REPAIRING', 'WAITING_CUSTOMER') AND DATE(created_at) = CURDATE()`, tenantID)
	if err != nil {
		return 0, 0, err
	}

	err = r.DB.Get(&completedTodayCount, `SELECT COUNT(*) FROM repairs WHERE deleted_at IS NULL AND tenant_id = ? AND status = 'COMPLETED' AND DATE(updated_at) = CURDATE()`, tenantID)
	if err != nil {
		return 0, 0, err
	}

	return repairingCount, completedTodayCount, nil
}

func (r *RepairRepo) GetPhoneBasicInfo(phoneID int, tenantID int) (string, string, string, error) {
	var p struct {
		ModelName string  `db:"model_name"`
		IMEI      string  `db:"imei"`
		Details   *string `db:"details"`
	}
	// Phải đảm bảo máy kho được lấy là máy của chính cửa hàng đó
	err := r.DB.Get(&p, "SELECT model_name, imei, details FROM phones WHERE id = ? AND tenant_id = ?", phoneID, tenantID)
	if err != nil {
		return "", "", "", err
	}
	var color string
	if p.Details != nil {
		var details map[string]interface{}
		if err := json.Unmarshal([]byte(*p.Details), &details); err == nil {
			if c, ok := details["color"].(string); ok {
				color = c
			}
		}
	}
	return p.ModelName, p.IMEI, color, nil
}

func (r *RepairRepo) HardDelete(id int, tenantID int) error {
	_, err := r.DB.Exec("DELETE FROM repairs WHERE id = ? AND tenant_id = ?", id, tenantID)
	return err
}

func (r *RepairRepo) SoftDelete(id int, tenantID int) error {
	_, err := r.DB.Exec("UPDATE repairs SET deleted_at = NOW() WHERE id = ? AND tenant_id = ?", id, tenantID)
	return err
}
