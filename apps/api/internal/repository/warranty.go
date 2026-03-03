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
	// 1. Insert thông tin ban đầu (chưa có mã)
	query := `
		INSERT INTO warranties (
			customer_id, phone_id, invoice_id, device_name, imei, description, technical_note, status, cost, start_date, end_date, created_at
		) VALUES (
			:customer_id, :phone_id, :invoice_id, :device_name, :imei, :description, :technical_note, 'RECEIVED', 0, :start_date, :end_date, NOW()
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

	// 2. Tự động sinh mã phiếu theo format: BH-DDMMYYYY-ID (VD: BH-03032026-001)
	currentTime := time.Now()
	dateStr := currentTime.Format("02012006") // Format DDMMYYYY
	warrantyCode := fmt.Sprintf("BH-%s-%03d", dateStr, id)

	// 3. Update mã phiếu ngược lại vào DB
	updateQuery := `UPDATE warranties SET warranty_code = ? WHERE id = ?`
	_, err = r.DB.Exec(updateQuery, warrantyCode, id)

	return int(id), err
}

func (r *WarrantyRepo) Update(id int, input model.UpdateWarrantyInput) error {
	query := `
		UPDATE warranties 
		SET 
			description = COALESCE(?, description),
			technical_note = COALESCE(?, technical_note),
			status = COALESCE(?, status),
			cost = COALESCE(?, cost),
			updated_at = NOW()
		WHERE id = ?
	`
	_, err := r.DB.Exec(query, input.Description, input.TechnicalNote, input.Status, input.Cost, id)
	return err
}

func (r *WarrantyRepo) GetByID(id int) (*model.WarrantyListItem, error) {
	var item model.WarrantyListItem
	query := `
		SELECT w.*, c.name as customer_name, c.phone as customer_phone, i.invoice_code, i.type
		FROM warranties w
		LEFT JOIN customers c ON w.customer_id = c.id
		LEFT JOIN invoices i ON w.invoice_id = i.id
		WHERE w.id = ? LIMIT 1
	`
	err := r.DB.Get(&item, query, id)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *WarrantyRepo) GetAll(filter model.WarrantyFilter) ([]model.WarrantyListItem, int, error) {
	offset := (filter.Page - 1) * filter.Limit
	var items []model.WarrantyListItem
	var total int
	var args []interface{}

	baseQuery := `
		FROM warranties w
		LEFT JOIN customers c ON w.customer_id = c.id
		LEFT JOIN invoices i ON w.invoice_id = i.id
		WHERE 1=1
	`

	if filter.Keyword != "" {
		baseQuery += ` AND (c.name LIKE ? OR c.phone LIKE ? OR w.device_name LIKE ? OR w.imei LIKE ?)`
		kw := "%" + filter.Keyword + "%"
		args = append(args, kw, kw, kw, kw)
	}
	if filter.Status != "" && filter.Status != "ALL" {
		baseQuery += ` AND w.status = ?`
		args = append(args, filter.Status)
	}

	if filter.StartDate != "" {
		baseQuery += ` AND w.created_at >= ?`
		args = append(args, filter.StartDate+" 00:00:00")
	}
	if filter.EndDate != "" {
		baseQuery += ` AND w.created_at <= ?`
		args = append(args, filter.EndDate+" 23:59:59")
	}

	countQuery := `SELECT COUNT(*) ` + baseQuery
	if err := r.DB.Get(&total, countQuery, args...); err != nil {
		return nil, 0, err
	}

	selectQuery := `SELECT w.*, c.name as customer_name, c.phone as customer_phone, i.type as type ` + baseQuery + ` ORDER BY w.created_at DESC LIMIT ? OFFSET ?`
	args = append(args, filter.Limit, offset)

	if err := r.DB.Select(&items, selectQuery, args...); err != nil {
		return nil, 0, err
	}

	return items, total, nil
}

func (r *WarrantyRepo) SearchEligibleItems(keyword string, invType string) ([]model.WarrantySearchItem, error) {
	var items []model.WarrantySearchItem

	query := `
		SELECT 
			ii.invoice_id, 
			i.invoice_code,
			ii.phone_id, 
			COALESCE(p.model_name, ii.description) AS device_name, 
			p.imei, 
			c.name AS customer_name, 
			c.phone AS customer_phone, 
			ii.warranty_expiry, 
			i.created_at AS base_date,
			
			-- LẤY CHUẨN DỮ LIỆU TỪ PHIẾU SỬA:
			r.description AS repair_description,
			rp.model_name AS repair_device_name
			
		FROM invoice_items ii
		JOIN invoices i ON ii.invoice_id = i.id
		LEFT JOIN phones p ON ii.phone_id = p.id
		LEFT JOIN customers c ON i.customer_id = c.id
		
		-- JOIN ĐỂ LẤY PHIẾU SỬA VÀ THÔNG TIN MÁY (NẾU CÓ)
		LEFT JOIN repairs r ON r.invoice_id = i.id
		LEFT JOIN phones rp ON r.phone_id = rp.id
		
		WHERE ii.warranty_months > 0 
			AND i.type = ?
			AND i.status = 'PAID'
	`
	var args []interface{}
	args = append(args, invType) // 'SALE' hoặc 'REPAIR'

	if keyword != "" {
		// Bổ sung thêm "OR i.invoice_code LIKE ?" để có thể tìm theo mã hoá đơn
		query += ` AND (p.imei LIKE ? OR c.phone LIKE ? OR c.name LIKE ? OR p.model_name LIKE ? OR ii.description LIKE ? OR i.invoice_code LIKE ?)`
		kw := "%" + keyword + "%"
		args = append(args, kw, kw, kw, kw, kw, kw)
	}

	query += ` ORDER BY i.created_at DESC LIMIT 10`

	err := r.DB.Select(&items, query, args...)
	return items, err
}

// --- THÊM HÀM MỚI LẤY THỐNG KÊ ---
func (r *WarrantyRepo) GetStats() (map[string]int, error) {
	stats := map[string]int{
		"receivedTodayCount": 0,
		"doneTodayCount":     0,
	}

	// 1. Dùng biến tạm để hứng số lượng máy tiếp nhận
	var receivedToday int
	err := r.DB.Get(&receivedToday, `SELECT COUNT(*) FROM warranties WHERE DATE(created_at) = CURDATE()`)
	if err != nil {
		return stats, err
	}
	stats["receivedTodayCount"] = receivedToday // Gán vào map sau khi lấy xong

	// 2. Dùng biến tạm để hứng số lượng máy đã trả
	var doneToday int
	err = r.DB.Get(&doneToday, `SELECT COUNT(*) FROM warranties WHERE status = 'DONE' AND DATE(updated_at) = CURDATE()`)
	if err != nil {
		return stats, err
	}
	stats["doneTodayCount"] = doneToday // Gán vào map sau khi lấy xong

	return stats, nil
}
