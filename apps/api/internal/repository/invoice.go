package repository

import (
	"api/internal/model"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
)

type InvoiceRepo struct {
	DB *sqlx.DB
}

func NewInvoiceRepo(db *sqlx.DB) *InvoiceRepo {
	return &InvoiceRepo{DB: db}
}

// CreateInvoice xử lý transaction tạo hóa đơn và item
func (r *InvoiceRepo) Create(inv model.Invoice, items []model.InvoiceItem) (int, error) {
	// 1. Bắt đầu Transaction
	tx, err := r.DB.Beginx()
	if err != nil {
		return 0, err
	}
	// Defer rollback nếu có lỗi xảy ra
	defer tx.Rollback()

	// 2. Insert Invoice Header
	queryInv := `
		INSERT INTO invoices (invoice_code, type, status, customer_id, total_amount, created_by, note, created_at)
		VALUES (:invoice_code, :type, :status, :customer_id, :total_amount, :created_by, :note, :created_at)
	`
	res, err := tx.NamedExec(queryInv, inv)
	if err != nil {
		return 0, err
	}
	invoiceID, _ := res.LastInsertId()

	// 3. Insert Invoice Items & Update Phone Status
	queryItem := `
		INSERT INTO invoice_items (invoice_id, item_type, phone_id, description, quantity, unit_price, amount, warranty_months, warranty_expiry)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	// Query update trạng thái máy (nếu bán)
	queryPhoneSold := `UPDATE phones SET status = 'SOLD', sale_price = ?, sale_date = ? WHERE id = ?`

	for _, item := range items {
		// Tính ngày hết hạn bảo hành
		var warrantyExpiry *time.Time
		if item.WarrantyMonths > 0 {
			t := inv.CreatedAt.AddDate(0, item.WarrantyMonths, 0)
			warrantyExpiry = &t
		}

		_, err = tx.Exec(queryItem,
			invoiceID, item.ItemType, item.PhoneID, item.Description,
			item.Quantity, item.UnitPrice, item.Amount,
			item.WarrantyMonths, warrantyExpiry,
		)
		if err != nil {
			return 0, err
		}

		// LOGIC QUAN TRỌNG: Nếu là đơn BÁN và item là PHONE -> Cập nhật trạng thái máy
		if inv.Type == model.InvoiceTypeSale && item.ItemType == model.ItemTypePhone && item.PhoneID != nil {
			_, err := tx.Exec(queryPhoneSold, item.UnitPrice, inv.CreatedAt, *item.PhoneID)
			if err != nil {
				return 0, fmt.Errorf("không thể cập nhật trạng thái máy ID %d: %v", *item.PhoneID, err)
			}
		}
	}

	// 4. Commit Transaction
	if err := tx.Commit(); err != nil {
		return 0, err
	}

	return int(invoiceID), nil
}

// GetByID lấy chi tiết hóa đơn kèm items
func (r *InvoiceRepo) GetByID(id int) (*model.Invoice, error) {
	var invoice model.Invoice
	// Lấy Header
	query := `
		SELECT i.*, u.full_name as creator_name, c.name as customer_name
		FROM invoices i
		LEFT JOIN users u ON i.created_by = u.id
		LEFT JOIN customers c ON i.customer_id = c.id
		WHERE i.id = ?
	`
	err := r.DB.Get(&invoice, query, id)
	if err != nil {
		return nil, err
	}

	// Lấy Items
	var items []model.InvoiceItem
	queryItems := `SELECT * FROM invoice_items WHERE invoice_id = ?`
	err = r.DB.Select(&items, queryItems, id)
	if err != nil {
		return nil, err
	}
	invoice.Items = items

	return &invoice, nil
}

// Hàm đếm số hóa đơn trong ngày của một loại cụ thể (để tính sequence)
func (r *InvoiceRepo) GetCountTodayByType(invType string) (int, error) {
	var count int
	// Đếm những hóa đơn có created_at trong ngày hôm nay VÀ cùng loại
	query := `
		SELECT COUNT(*) FROM invoices 
		WHERE type = ? 
		AND DATE(created_at) = DATE(NOW())
	`
	err := r.DB.Get(&count, query, invType)
	return count, err
}
