package repository

import (
	"api/internal/model"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
)

type WarrantyRepo struct {
	DB *sqlx.DB
}

func NewWarrantyRepo(db *sqlx.DB) *WarrantyRepo {
	return &WarrantyRepo{DB: db}
}

func (r *WarrantyRepo) Create(w model.Warranty, userID int, tenantID int) (int, error) {
	w.UserID = userID
	w.TenantID = tenantID

	query := `
		INSERT INTO warranties (
			tenant_id, phone_id, invoice_id, device_name, imei, description, technical_note, 
			status, cost, start_date, end_date, created_at, user_id
		) VALUES (
			:tenant_id, :phone_id, :invoice_id, :device_name, :imei, :description, :technical_note, 
			'RECEIVED', :cost, :start_date, :end_date, NOW(), :user_id
		)
	`
	res, err := r.DB.NamedExec(query, w)
	if err != nil {
		return 0, err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return 0, err
	}

	code := fmt.Sprintf("BH-%s-%06d", time.Now().Format("02012006"), id)
	_, err = r.DB.Exec("UPDATE warranties SET warranty_code = ? WHERE id = ? AND tenant_id = ?", code, id, tenantID)

	return int(id), err
}

func (r *WarrantyRepo) GetAll(filter model.WarrantyFilter, tenantID int) ([]model.WarrantyListItem, int, error) {
	offset := (filter.Page - 1) * filter.Limit
	var items []model.WarrantyListItem
	var total int

	baseQuery := `
		FROM warranties w
		LEFT JOIN invoices i ON w.invoice_id = i.id
		WHERE w.deleted_at IS NULL AND w.tenant_id = ?
	`
	var args []interface{}
	args = append(args, tenantID)

	if filter.Keyword != "" {
		baseQuery += ` AND (w.warranty_code LIKE ? OR i.customer_name LIKE ? OR i.customer_phone LIKE ? OR w.imei LIKE ? OR w.device_name LIKE ?)`
		kw := "%" + filter.Keyword + "%"
		args = append(args, kw, kw, kw, kw, kw)
	}
	if filter.Status != "" && filter.Status != "ALL" {
		baseQuery += ` AND w.status = ?`
		args = append(args, filter.Status)
	}
	if filter.StartDate != "" && filter.EndDate != "" {
		baseQuery += ` AND DATE(w.created_at) >= ? AND DATE(w.created_at) <= ?`
		args = append(args, filter.StartDate, filter.EndDate)
	}

	countQuery := `SELECT COUNT(*) ` + baseQuery
	if err := r.DB.Get(&total, countQuery, args...); err != nil {
		return nil, 0, err
	}

	selectQuery := `
		SELECT 
			w.*, 
			i.type,
			i.invoice_code,
			i.customer_name,
			i.customer_phone,
			i.customer_id_number
	` + baseQuery + ` ORDER BY w.created_at DESC LIMIT ? OFFSET ?`

	args = append(args, filter.Limit, offset)
	if err := r.DB.Select(&items, selectQuery, args...); err != nil {
		return nil, 0, err
	}

	return items, total, nil
}

func (r *WarrantyRepo) GetByID(id int, tenantID int) (*model.WarrantyListItem, error) {
	var item model.WarrantyListItem
	query := `
		SELECT 
			w.*, 
			i.type,
			i.invoice_code,
			i.customer_name,
			i.customer_phone,
			i.customer_id_number,
			(SELECT MAX(warranty_months) FROM invoice_items WHERE invoice_id = w.invoice_id) as warranty_months
		FROM warranties w
		LEFT JOIN invoices i ON w.invoice_id = i.id
		WHERE w.id = ? AND w.tenant_id = ?
	`
	err := r.DB.Get(&item, query, id, tenantID)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *WarrantyRepo) Update(id int, input model.UpdateWarrantyInput, tenantID int) error {
	query := `
		UPDATE warranties SET
			status = COALESCE(?, status),
			cost = COALESCE(?, cost),
			technical_note = COALESCE(?, technical_note),
			description = COALESCE(?, description),
			updated_at = NOW()
		WHERE id = ? AND tenant_id = ?
	`
	_, err := r.DB.Exec(query,
		input.Status, input.Cost, input.TechnicalNote, input.Description, id, tenantID,
	)
	return err
}

func (r *WarrantyRepo) SearchWarranty(keyword string, invType string, tenantID int) ([]model.WarrantySearchItem, error) {
	var items []model.WarrantySearchItem
	query := `
		SELECT 
			i.id as invoice_id,
			i.invoice_code,
			ii.phone_id,
			COALESCE(p.model_name, JSON_UNQUOTE(JSON_EXTRACT(r.description, '$.device_name')), ii.description) as device_name,
			COALESCE(p.imei, JSON_UNQUOTE(JSON_EXTRACT(r.description, '$.imei'))) as imei,
			i.customer_name,
			i.customer_phone,
			i.customer_id_number,
			ii.warranty_expiry,
			ii.warranty_months,
			ii.description as part_name,
			ii.item_type as item_type
		FROM invoice_items ii
		JOIN invoices i ON ii.invoice_id = i.id
		LEFT JOIN phones p ON ii.phone_id = p.id
		LEFT JOIN repairs r ON r.invoice_id = i.id
		WHERE ii.warranty_expiry IS NOT NULL
			AND i.type = ?
			AND i.status = 'PAID'
			AND i.tenant_id = ? 
			AND (
				p.id IS NULL OR 
				COALESCE(p.imei, '') = '' OR
				p.id = (SELECT MAX(id) FROM phones WHERE imei = p.imei AND tenant_id = p.tenant_id)
			)
	`
	var args []interface{}
	args = append(args, invType, tenantID) // Đã khoá data theo chủ cửa hàng

	if keyword != "" {
		query += ` AND (
			p.imei LIKE ? OR 
			JSON_UNQUOTE(JSON_EXTRACT(r.description, '$.imei')) LIKE ? OR 
			i.customer_phone LIKE ? OR 
			i.customer_name LIKE ? OR 
			p.model_name LIKE ? OR 
			JSON_UNQUOTE(JSON_EXTRACT(r.description, '$.device_name')) LIKE ? OR 
			ii.description LIKE ? OR 
			i.invoice_code LIKE ?
		)`
		kw := "%" + keyword + "%"
		args = append(args, kw, kw, kw, kw, kw, kw, kw, kw)
	}

	query += ` ORDER BY i.created_at DESC LIMIT 10`
	err := r.DB.Select(&items, query, args...)
	return items, err
}

func (r *WarrantyRepo) GetStats(tenantID int) (map[string]int, error) {
	stats := map[string]int{
		"receivedTodayCount": 0,
		"doneTodayCount":     0,
	}

	var receivedToday int
	_ = r.DB.Get(&receivedToday, `SELECT COUNT(*) FROM warranties WHERE deleted_at IS NULL AND tenant_id = ? AND DATE(created_at) = CURDATE()`, tenantID)
	stats["receivedTodayCount"] = receivedToday

	var doneToday int
	_ = r.DB.Get(&doneToday, `SELECT COUNT(*) FROM warranties WHERE deleted_at IS NULL AND tenant_id = ? AND status IN ('COMPLETED', 'DELIVERED', 'DONE') AND DATE(updated_at) = CURDATE()`, tenantID)
	stats["doneTodayCount"] = doneToday

	return stats, nil
}

func (r *WarrantyRepo) HardDelete(id int, tenantID int) error {
	_, err := r.DB.Exec("DELETE FROM warranties WHERE id = ? AND tenant_id = ?", id, tenantID)
	return err
}

func (r *WarrantyRepo) SoftDelete(id int, tenantID int) error {
	_, err := r.DB.Exec("UPDATE warranties SET deleted_at = NOW() WHERE id = ? AND tenant_id = ?", id, tenantID)
	return err
}
