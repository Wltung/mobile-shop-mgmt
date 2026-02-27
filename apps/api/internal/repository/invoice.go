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
		INSERT INTO invoices (
            invoice_code, type, status, payment_method, 
            customer_id, total_amount, created_by, note, created_at
        )
		VALUES (
            :invoice_code, :type, :status, :payment_method, 
            :customer_id, :total_amount, :created_by, :note, :created_at
        )
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
		SELECT i.*, u.full_name as creator_name, c.name as customer_name, 
			c.phone as customer_phone, c.id_number as customer_id_number -- Lấy thêm phone/address khách nếu cần
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

func (r *InvoiceRepo) UpdateStatus(id int, status string) error {
	query := `UPDATE invoices SET status = ?, updated_at = NOW() WHERE id = ?`
	_, err := r.DB.Exec(query, status, id)
	return err
}

func (r *InvoiceRepo) Update(id int, input model.UpdateInvoiceInput, newCustomerID *int) error {
	tx, err := r.DB.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// ---------------------------------------------------------
	// 1. UPDATE INVOICE HEADER
	// ---------------------------------------------------------
	// Sử dụng logic COALESCE(?, col): Nếu tham số là NULL, giữ nguyên giá trị cột cũ
	queryInv := `
		UPDATE invoices 
		SET payment_method = COALESCE(?, payment_method),
			status = COALESCE(?, status), 
			note = COALESCE(?, note),
			created_at = COALESCE(?, created_at),
			updated_at = NOW()
	`

	// Tạo slice chứa các tham số theo đúng thứ tự của dấu ?
	args := []interface{}{
		input.PaymentMethod,
		input.Status,
		input.Note,
		input.CreatedAt,
	}

	// Logic động: Nếu có newCustomerID -> thêm vào câu query
	if newCustomerID != nil {
		queryInv += `, customer_id = ?`
		args = append(args, *newCustomerID)
	}

	// Thêm điều kiện WHERE
	queryInv += ` WHERE id = ?`
	args = append(args, id)

	// Sử dụng Exec (thay vì NamedExec) vì chúng ta đã dùng ?
	if _, err := tx.Exec(queryInv, args...); err != nil {
		return err
	}

	// ---------------------------------------------------------
	// 2. XỬ LÝ MÁY & NGÀY BÁN (PHONES TABLE)
	// ---------------------------------------------------------
	var currentItem struct {
		ID      int `db:"id"`
		PhoneID int `db:"phone_id"`
	}
	// Lấy Item loại PHONE
	err = tx.Get(&currentItem, "SELECT id, phone_id FROM invoice_items WHERE invoice_id = ? AND item_type = 'PHONE' LIMIT 1", id)

	if err == nil {
		targetPhoneID := currentItem.PhoneID
		isPhoneSwapped := false

		// A. Logic Đổi Máy (Nếu có gửi PhoneID và khác máy cũ)
		if input.PhoneID != nil && *input.PhoneID != currentItem.PhoneID {
			newPhoneID := *input.PhoneID

			// 1. Trả máy cũ về kho (Revert)
			_, err = tx.Exec("UPDATE phones SET status = 'IN_STOCK', sale_price = NULL, sale_date = NULL WHERE id = ?", currentItem.PhoneID)
			if err != nil {
				return err
			}

			// 2. Cập nhật Invoice Item trỏ sang máy mới
			_, err = tx.Exec("UPDATE invoice_items SET phone_id = ?, description = (SELECT model_name FROM phones WHERE id = ?) WHERE id = ?", newPhoneID, newPhoneID, currentItem.ID)
			if err != nil {
				return err
			}

			targetPhoneID = newPhoneID
			isPhoneSwapped = true
		}

		// B. Cập nhật thông tin máy đích (Target Phone)
		updatePhoneQuery := `UPDATE phones SET status = 'SOLD', updated_at = NOW()`
		var phoneArgs []interface{}

		// - Update Giá bán (nếu có input)
		if input.ActualSalePrice != "" {
			updatePhoneQuery += `, sale_price = ?`
			phoneArgs = append(phoneArgs, input.ActualSalePrice)
		}

		// - Update Ngày bán
		// Ưu tiên ngày từ input.CreatedAt (SaleDate). Nếu không có nhưng là Đổi máy -> dùng NOW()
		if input.CreatedAt != nil {
			updatePhoneQuery += `, sale_date = ?`
			phoneArgs = append(phoneArgs, *input.CreatedAt)
		} else if isPhoneSwapped {
			updatePhoneQuery += `, sale_date = NOW()`
		}

		updatePhoneQuery += ` WHERE id = ?`
		phoneArgs = append(phoneArgs, targetPhoneID)

		if _, err := tx.Exec(updatePhoneQuery, phoneArgs...); err != nil {
			return err
		}

		// C. Cập nhật giá và bảo hành trong Invoice Items
		updateItemQuery := `UPDATE invoice_items SET updated_at = NOW()`
		var itemArgs []interface{}

		if input.ActualSalePrice != "" {
			updateItemQuery += `, unit_price = ?, amount = ?`
			itemArgs = append(itemArgs, input.ActualSalePrice, input.ActualSalePrice)
		}
		if input.Warranty != "" {
			updateItemQuery += `, warranty_months = ?`
			itemArgs = append(itemArgs, input.Warranty)
		}

		updateItemQuery += ` WHERE id = ?`
		itemArgs = append(itemArgs, currentItem.ID)

		if _, err := tx.Exec(updateItemQuery, itemArgs...); err != nil {
			return err
		}

		// D. Cập nhật Tổng tiền hoá đơn
		if input.ActualSalePrice != "" {
			if _, err := tx.Exec("UPDATE invoices SET total_amount = ? WHERE id = ?", input.ActualSalePrice, id); err != nil {
				return err
			}
		}
	}

	return tx.Commit()
}
func (r *InvoiceRepo) GetCustomerIDByInvoiceID(invoiceID int) (int, error) {
	var customerID int
	// Sử dụng Get (safe) hoặc QueryRow
	err := r.DB.Get(&customerID, "SELECT customer_id FROM invoices WHERE id = ?", invoiceID)
	if err != nil {
		return 0, err
	}
	return customerID, nil
}
