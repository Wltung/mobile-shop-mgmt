package repository

import (
	"api/internal/model"
	"strconv"
	"time"

	"github.com/jmoiron/sqlx"
)

type InvoiceRepo struct {
	DB *sqlx.DB
}

func NewInvoiceRepo(db *sqlx.DB) *InvoiceRepo {
	return &InvoiceRepo{DB: db}
}

func (r *InvoiceRepo) Create(inv model.Invoice, items []model.InvoiceItem) (int, error) {
	tx, err := r.DB.Beginx()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	// Insert Invoice Header
	queryInv := `
		INSERT INTO invoices (
            invoice_code, type, status, payment_method, 
            customer_name, customer_phone, customer_id_number, 
            total_amount, discount, created_by, note, created_at
        )
		VALUES (
            :invoice_code, :type, :status, :payment_method, 
            :customer_name, :customer_phone, :customer_id_number, 
            :total_amount, :discount, :created_by, :note, :created_at
        )
	`
	res, err := tx.NamedExec(queryInv, inv)
	if err != nil {
		return 0, err
	}
	invoiceID, _ := res.LastInsertId()

	queryItem := `
		INSERT INTO invoice_items (invoice_id, item_type, phone_id, description, quantity, unit_price, amount, warranty_months, warranty_expiry)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	for _, item := range items {
		var warrantyExpiry *time.Time

		// ĐÃ FIX 1: Chỉ kích hoạt bảo hành (tính ngày) nếu hoá đơn ĐÃ THANH TOÁN
		if inv.Status == model.InvoiceStatusPaid {
			if item.WarrantyMonths > 0 || item.WarrantyDays > 0 {
				t := inv.CreatedAt.AddDate(0, item.WarrantyMonths, item.WarrantyDays)
				warrantyExpiry = &t
			}
		}

		_, err = tx.Exec(queryItem,
			invoiceID, item.ItemType, item.PhoneID, item.Description,
			item.Quantity, item.UnitPrice, item.Amount,
			item.WarrantyMonths, warrantyExpiry,
		)
		if err != nil {
			return 0, err
		}
	}

	if err := tx.Commit(); err != nil {
		return 0, err
	}

	return int(invoiceID), nil
}

func (r *InvoiceRepo) GetByID(id int) (*model.Invoice, error) {
	var invoice model.Invoice
	// Xoá JOIN customers, vì các cột customer_name,... đã nằm ngay trên bảng invoices
	query := `
		SELECT 
			i.*, 
			u.full_name as creator_name, 
			r.id as repair_id
		FROM invoices i
		LEFT JOIN users u ON i.created_by = u.id
		LEFT JOIN repairs r ON r.invoice_id = i.id
		WHERE i.id = ?
	`
	err := r.DB.Get(&invoice, query, id)
	if err != nil {
		return nil, err
	}

	var items []model.InvoiceItem
	queryItems := `
		SELECT 
			ii.*,
			p.imei as imei,
			p.details as phone_details
		FROM invoice_items ii
		LEFT JOIN phones p ON ii.phone_id = p.id
		WHERE ii.invoice_id = ?
	`
	err = r.DB.Select(&items, queryItems, id)
	if err != nil {
		return nil, err
	}
	invoice.Items = items

	return &invoice, nil
}

func (r *InvoiceRepo) GetCountTodayByType(invType string) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM invoices WHERE type = ? AND DATE(created_at) = DATE(NOW())`
	err := r.DB.Get(&count, query, invType)
	return count, err
}

func (r *InvoiceRepo) UpdateStatus(id int, status string) error {
	tx, err := r.DB.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `UPDATE invoices SET status = ?, updated_at = NOW() WHERE id = ?`
	_, err = tx.Exec(query, status, id)
	if err != nil {
		return err
	}

	// ĐÃ FIX 2: Nếu hoá đơn được chuyển sang PAID, KÍCH HOẠT BẢO HÀNH cho các linh kiện đang bị treo
	if status == model.InvoiceStatusPaid {
		queryActivate := `
			UPDATE invoice_items 
			SET warranty_expiry = DATE_ADD(NOW(), INTERVAL warranty_months MONTH) 
			WHERE invoice_id = ? AND warranty_expiry IS NULL AND warranty_months > 0
		`
		_, err = tx.Exec(queryActivate, id)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *InvoiceRepo) Update(id int, input model.UpdateInvoiceInput) error {
	tx, err := r.DB.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Lấy trạng thái và ngày tạo hiện tại của Hoá đơn để làm gốc tính toán
	var currentInv struct {
		Status    string    `db:"status"`
		CreatedAt time.Time `db:"created_at"`
	}
	_ = tx.Get(&currentInv, "SELECT status, created_at FROM invoices WHERE id = ?", id)

	// 2. Update Header
	queryInv := `
		UPDATE invoices 
		SET payment_method = COALESCE(?, payment_method),
			status = COALESCE(?, status), 
			note = COALESCE(?, note),
			created_at = COALESCE(?, created_at),
			discount = COALESCE(?, discount),
			customer_name = COALESCE(?, customer_name),
			customer_phone = COALESCE(?, customer_phone),
			customer_id_number = COALESCE(?, customer_id_number),
			updated_at = NOW()
		WHERE id = ?
	`
	args := []interface{}{
		input.PaymentMethod, input.Status, input.Note, input.CreatedAt,
		input.Discount, input.CustomerName, input.CustomerPhone, input.CustomerIDNumber, id,
	}
	if _, err := tx.Exec(queryInv, args...); err != nil {
		return err
	}

	// ĐÃ FIX 3: Nếu Form Edit chuyển trạng thái sang PAID, KÍCH HOẠT BẢO HÀNH
	if input.Status != nil && *input.Status == model.InvoiceStatusPaid {
		queryActivate := `
			UPDATE invoice_items 
			SET warranty_expiry = DATE_ADD(NOW(), INTERVAL warranty_months MONTH) 
			WHERE invoice_id = ? AND warranty_expiry IS NULL AND warranty_months > 0
		`
		if _, err := tx.Exec(queryActivate, id); err != nil {
			return err
		}
	}

	// 3. Cập nhật bảng invoice_items
	var currentItem struct {
		ID      int `db:"id"`
		PhoneID int `db:"phone_id"`
	}
	err = tx.Get(&currentItem, "SELECT id, phone_id FROM invoice_items WHERE invoice_id = ? AND item_type = 'PHONE' LIMIT 1", id)

	if err == nil {
		if input.PhoneID != nil && *input.PhoneID != currentItem.PhoneID {
			newPhoneID := *input.PhoneID

			updateItemQuery := `
				UPDATE invoice_items 
				SET phone_id = ?, 
					description = (SELECT model_name FROM phones WHERE id = ?),
					unit_price = COALESCE((SELECT sale_price FROM phones WHERE id = ?), 0),
					amount = COALESCE((SELECT sale_price FROM phones WHERE id = ?), 0)
				WHERE id = ?
			`
			_, err = tx.Exec(updateItemQuery, newPhoneID, newPhoneID, newPhoneID, newPhoneID, currentItem.ID)
			if err != nil {
				return err
			}
		}

		updateItemQuery := `UPDATE invoice_items SET updated_at = NOW()`
		var itemArgs []interface{}

		if input.Warranty != "" {
			updateItemQuery += `, warranty_months = ?`
			itemArgs = append(itemArgs, input.Warranty)

			isPaid := currentInv.Status == model.InvoiceStatusPaid
			if input.Status != nil && *input.Status == model.InvoiceStatusPaid {
				isPaid = true
			}

			if isPaid {
				months, _ := strconv.Atoi(input.Warranty)
				newExpiry := currentInv.CreatedAt.AddDate(0, months, 0)
				if currentInv.Status == model.InvoiceStatusDraft && input.Status != nil && *input.Status == model.InvoiceStatusPaid {
					newExpiry = time.Now().AddDate(0, months, 0)
				}
				updateItemQuery += `, warranty_expiry = ?`
				itemArgs = append(itemArgs, newExpiry)
			}
		}

		updateItemQuery += ` WHERE id = ?`
		itemArgs = append(itemArgs, currentItem.ID)

		if _, err := tx.Exec(updateItemQuery, itemArgs...); err != nil {
			return err
		}

		// ĐÃ FIX 3: Nếu có thay đổi giá chốt (ActualSalePrice), ta update vào bảng `invoices`
		// Công thức: total_amount = Giá chốt, discount = (unit_price của linh kiện) - Giá chốt
		if input.ActualSalePrice != "" {
			updateInvSql := `
				UPDATE invoices 
				SET total_amount = ?, 
					discount = (SELECT amount FROM invoice_items WHERE invoice_id = ? AND item_type = 'PHONE' LIMIT 1) - ?
				WHERE id = ?
			`
			if _, err := tx.Exec(updateInvSql, input.ActualSalePrice, id, input.ActualSalePrice, id); err != nil {
				return err
			}
		}
	}

	return tx.Commit()
}

func (r *InvoiceRepo) GetAll(filter model.InvoiceFilter) ([]model.Invoice, int, error) {
	offset := (filter.Page - 1) * filter.Limit
	var items []model.Invoice
	var total int

	// Không cần JOIN bảng customers nữa
	baseQuery := `FROM invoices i WHERE 1=1`
	var args []interface{}

	if filter.Keyword != "" {
		baseQuery += ` AND (i.invoice_code LIKE ? OR i.customer_name LIKE ? OR i.customer_phone LIKE ?)`
		kw := "%" + filter.Keyword + "%"
		args = append(args, kw, kw, kw)
	}
	if filter.Type != "" && filter.Type != "ALL" {
		baseQuery += ` AND i.type = ?`
		args = append(args, filter.Type)
	}
	if filter.Status != "" && filter.Status != "ALL" {
		baseQuery += ` AND i.status = ?`
		args = append(args, filter.Status)
	}
	if filter.StartDate != "" && filter.EndDate != "" {
		baseQuery += ` AND DATE(i.created_at) >= ? AND DATE(i.created_at) <= ?`
		args = append(args, filter.StartDate, filter.EndDate)
	}

	countQuery := `SELECT COUNT(*) ` + baseQuery
	if err := r.DB.Get(&total, countQuery, args...); err != nil {
		return nil, 0, err
	}

	selectQuery := `SELECT i.* ` + baseQuery + ` ORDER BY i.created_at DESC LIMIT ? OFFSET ?`
	args = append(args, filter.Limit, offset)

	if err := r.DB.Select(&items, selectQuery, args...); err != nil {
		return nil, 0, err
	}

	return items, total, nil
}

func (r *InvoiceRepo) GetDailyStats() (int, int64, error) {
	var count int
	var revenue int64

	err := r.DB.Get(&count, `SELECT COUNT(*) FROM invoices WHERE DATE(created_at) = CURDATE()`)
	if err != nil {
		return 0, 0, err
	}

	err = r.DB.Get(&revenue, `
		SELECT COALESCE(SUM(total_amount), 0) 
		FROM invoices 
		WHERE DATE(created_at) = CURDATE() 
			AND status = 'PAID' 
			AND type != 'IMPORT'
	`)
	if err != nil {
		return 0, 0, err
	}

	return count, revenue, nil
}
