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

func (r *WarrantyRepo) Create(w model.Warranty) (int, error) {
	query := `
		INSERT INTO warranties (
			customer_name, customer_phone, phone_id, invoice_id, 
			device_name, imei, description, technical_note, 
			status, cost, start_date, end_date, created_at
		) VALUES (
			:customer_name, :customer_phone, :phone_id, :invoice_id, 
			:device_name, :imei, :description, :technical_note, 
			'RECEIVED', 0, :start_date, :end_date, NOW()
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
	_, err = r.DB.Exec("UPDATE warranties SET warranty_code = ? WHERE id = ?", code, id)

	return int(id), err
}

func (r *WarrantyRepo) GetAll(filter model.WarrantyFilter) ([]model.WarrantyListItem, int, error) {
	offset := (filter.Page - 1) * filter.Limit
	var items []model.WarrantyListItem
	var total int

	baseQuery := `
		FROM warranties w
		LEFT JOIN invoices i ON w.invoice_id = i.id
		WHERE 1=1
	`
	var args []interface{}

	if filter.Keyword != "" {
		baseQuery += ` AND (w.warranty_code LIKE ? OR w.customer_name LIKE ? OR w.customer_phone LIKE ? OR w.imei LIKE ?)`
		kw := "%" + filter.Keyword + "%"
		args = append(args, kw, kw, kw, kw)
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
			i.invoice_code
	` + baseQuery + ` ORDER BY w.created_at DESC LIMIT ? OFFSET ?`

	args = append(args, filter.Limit, offset)
	if err := r.DB.Select(&items, selectQuery, args...); err != nil {
		return nil, 0, err
	}

	return items, total, nil
}

func (r *WarrantyRepo) GetByID(id int) (*model.WarrantyListItem, error) {
	var item model.WarrantyListItem
	query := `
		SELECT 
			w.*, 
			i.type,
			i.invoice_code
		FROM warranties w
		LEFT JOIN invoices i ON w.invoice_id = i.id
		WHERE w.id = ?
	`
	err := r.DB.Get(&item, query, id)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *WarrantyRepo) Update(id int, input model.UpdateWarrantyInput) error {
	query := `
		UPDATE warranties SET
			status = COALESCE(?, status),
			cost = COALESCE(?, cost),
			technical_note = COALESCE(?, technical_note),
			description = COALESCE(?, description),
			updated_at = NOW()
		WHERE id = ?
	`
	_, err := r.DB.Exec(query,
		input.Status,
		input.Cost,
		input.TechnicalNote,
		input.Description,
		id,
	)
	return err
}

func (r *WarrantyRepo) SearchWarranty(keyword string, invType string) ([]model.WarrantySearchItem, error) {
	var items []model.WarrantySearchItem
	query := `
		SELECT 
			i.id as invoice_id,
			i.invoice_code,
			ii.phone_id,
			COALESCE(p.model_name, ii.description) as device_name,
			p.imei,
			i.customer_name,
			i.customer_phone,
			ii.warranty_expiry,
			ii.warranty_months
		FROM invoice_items ii
		JOIN invoices i ON ii.invoice_id = i.id
		LEFT JOIN phones p ON ii.phone_id = p.id
		WHERE ii.warranty_months > 0 
			AND i.type = ?
			AND i.status = 'PAID'
	`
	var args []interface{}
	args = append(args, invType)

	if keyword != "" {
		query += ` AND (p.imei LIKE ? OR i.customer_phone LIKE ? OR i.customer_name LIKE ? OR p.model_name LIKE ? OR ii.description LIKE ? OR i.invoice_code LIKE ?)`
		kw := "%" + keyword + "%"
		args = append(args, kw, kw, kw, kw, kw, kw)
	}

	query += ` ORDER BY i.created_at DESC LIMIT 10`

	err := r.DB.Select(&items, query, args...)
	return items, err
}

func (r *WarrantyRepo) GetStats() (map[string]int, error) {
	stats := map[string]int{
		"receivedTodayCount": 0,
		"doneTodayCount":     0,
	}

	var receivedToday int
	_ = r.DB.Get(&receivedToday, `SELECT COUNT(*) FROM warranties WHERE DATE(created_at) = CURDATE()`)
	stats["receivedTodayCount"] = receivedToday

	var doneToday int
	_ = r.DB.Get(&doneToday, `SELECT COUNT(*) FROM warranties WHERE status IN ('COMPLETED', 'DELIVERED') AND DATE(updated_at) = CURDATE()`)
	stats["doneTodayCount"] = doneToday

	return stats, nil
}
