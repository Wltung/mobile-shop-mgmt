package repository

import (
	"api/internal/model"
	"database/sql"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

type PhoneRepo struct {
	DB *sqlx.DB
}

func NewPhoneRepo(db *sqlx.DB) *PhoneRepo {
	return &PhoneRepo{DB: db}
}

func (r *PhoneRepo) Create(p model.Phone) (int, error) {
	query := `
		INSERT INTO phones (imei, model_name, details, status, purchase_price, sale_price, purchase_date, note, import_by, seller_name, seller_phone, seller_id_number)
		VALUES (:imei, :model_name, :details, :status, :purchase_price, :sale_price, :purchase_date, :note, :import_by, :seller_name, :seller_phone, :seller_id_number)
	`
	res, err := r.DB.NamedExec(query, p)
	if err != nil {
		return 0, err
	}
	id, err := res.LastInsertId()
	return int(id), err
}

func (r *PhoneRepo) GetByIMEI(imei string, userID int) (*model.Phone, error) {
	var phone model.Phone
	query := `SELECT * FROM phones WHERE import_by = ? AND imei = ? LIMIT 1`
	err := r.DB.Get(&phone, query, userID, imei)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &phone, err
}

func (r *PhoneRepo) fetchList(baseQuery string, args []interface{}, sumCol string, selectClause string, orderBy string, limit, offset int) ([]model.Phone, int, float64, error) {
	var phones []model.Phone
	var totalCount int
	var totalValue float64

	countQuery := "SELECT COUNT(*) " + baseQuery
	if err := r.DB.Get(&totalCount, countQuery, args...); err != nil {
		return nil, 0, 0, err
	}

	sumQuery := "SELECT COALESCE(SUM(" + sumCol + "), 0) " + baseQuery
	if err := r.DB.Get(&totalValue, sumQuery, args...); err != nil {
		return nil, 0, 0, err
	}

	fullQuery := selectClause + " " + baseQuery + " ORDER BY " + orderBy + " LIMIT ? OFFSET ?"
	queryArgs := append(args, limit, offset)

	if err := r.DB.Select(&phones, fullQuery, queryArgs...); err != nil {
		return nil, 0, 0, err
	}

	return phones, totalCount, totalValue, nil
}

func (r *PhoneRepo) GetImports(userID int, filter model.PhoneFilter) ([]model.Phone, int, float64, error) {
	// 1. Thêm LEFT JOIN tới invoice_items và invoices (Chỉ lấy hoá đơn IMPORT)
	baseQuery := `
		FROM phones p 
		LEFT JOIN users u ON p.import_by = u.id 
		LEFT JOIN (
			SELECT ii.phone_id, i.status, i.id, i.invoice_code, i.payment_method
			FROM invoice_items ii
			JOIN invoices i ON ii.invoice_id = i.id
			WHERE ii.item_type = 'PHONE' AND i.type = 'IMPORT'
		) inv ON p.id = inv.phone_id
		WHERE p.import_by = ?
	`
	args := []interface{}{userID}

	if filter.Keyword != "" {
		baseQuery += " AND (p.imei LIKE ? OR p.model_name LIKE ? OR p.seller_name LIKE ? OR p.seller_phone LIKE ?)"
		likeStr := "%" + filter.Keyword + "%"
		args = append(args, likeStr, likeStr, likeStr, likeStr)
	}
	if filter.Status != "" && filter.Status != "ALL" {
		baseQuery += " AND p.status = ?"
		args = append(args, filter.Status)
	}
	if filter.StartDate != "" && filter.EndDate != "" {
		baseQuery += " AND DATE(p.purchase_date) BETWEEN ? AND ?"
		args = append(args, filter.StartDate, filter.EndDate)
	}
	if filter.HasSalePrice {
		baseQuery += " AND p.sale_price > 0"
	}
	if filter.InvoiceStatus != "" && filter.InvoiceStatus != "ALL" {
		baseQuery += " AND inv.status = ?"
		args = append(args, filter.InvoiceStatus)
	}

	// 2. Select thêm inv.status
	selectClause := `
        SELECT p.*, 
        u.full_name as importer_name,
        inv.status as invoice_status,
        inv.id as invoice_id,
        inv.invoice_code as invoice_code
    `

	orderBy := "p.purchase_date DESC, p.created_at DESC"
	offset := (filter.Page - 1) * filter.Limit

	return r.fetchList(baseQuery, args, "p.purchase_price", selectClause, orderBy, filter.Limit, offset)
}

func (r *PhoneRepo) GetSales(userID int, filter model.PhoneFilter) ([]model.Phone, int, float64, error) {
	baseQuery := `
		FROM phones p 
        JOIN invoice_items ii ON p.id = ii.phone_id
        JOIN invoices inv ON ii.invoice_id = inv.id AND inv.type = 'SALE'
        -- ĐÃ XOÁ LEFT JOIN CUSTOMERS, DÙNG TRỰC TIẾP inv.customer_name
        WHERE p.import_by = ? AND p.status = 'SOLD'
	`
	args := []interface{}{userID}

	if filter.Keyword != "" {
		baseQuery += " AND (p.imei LIKE ? OR p.model_name LIKE ? OR inv.customer_name LIKE ?)"
		likeStr := "%" + filter.Keyword + "%"
		args = append(args, likeStr, likeStr, likeStr)
	}
	if filter.Status != "" && filter.Status != "ALL" {
		baseQuery += " AND inv.status = ?"
		args = append(args, filter.Status)
	}
	if filter.StartDate != "" && filter.EndDate != "" {
		baseQuery += " AND DATE(p.sale_date) BETWEEN ? AND ?"
		args = append(args, filter.StartDate, filter.EndDate)
	}

	selectClause := `
		SELECT p.*, 
		inv.customer_name as buyer_name, 
		inv.status as invoice_status,
		inv.id as invoice_id,
		inv.invoice_code as invoice_code
	`
	orderBy := "p.sale_date DESC, inv.created_at DESC"
	offset := (filter.Page - 1) * filter.Limit

	return r.fetchList(baseQuery, args, "p.sale_price", selectClause, orderBy, filter.Limit, offset)
}

func (r *PhoneRepo) GetByID(id, userID int) (*model.Phone, error) {
	var phone model.Phone
	query := `
		SELECT 
			p.*, 
			COALESCE(u.full_name, 'Unknown') as importer_name,
			inv.invoice_code as invoice_code,
			inv.id as invoice_id,
			inv.status as invoice_status,
			inv.payment_method as payment_method
		FROM phones p
		LEFT JOIN users u ON p.import_by = u.id
		LEFT JOIN invoice_items ii ON p.id = ii.phone_id AND ii.item_type = 'PHONE'
		LEFT JOIN invoices inv ON ii.invoice_id = inv.id AND inv.type = 'IMPORT'
		WHERE p.id = ? AND p.import_by = ?
		LIMIT 1
	`
	err := r.DB.Get(&phone, query, id, userID)
	if err != nil {
		return nil, err
	}
	return &phone, nil
}

func (r *PhoneRepo) UpdateDynamic(id int, userID int, input model.PhoneUpdateInput) error {
	setClauses := []string{}
	args := []interface{}{}

	setClauses = append(setClauses, "updated_at = NOW()")

	if input.IMEI != nil {
		setClauses = append(setClauses, "imei = ?")
		args = append(args, *input.IMEI)
	}
	if input.ModelName != nil {
		setClauses = append(setClauses, "model_name = ?")
		args = append(args, *input.ModelName)
	}
	if input.PurchasePrice != nil {
		setClauses = append(setClauses, "purchase_price = ?")
		args = append(args, *input.PurchasePrice)
	}
	if input.PurchaseDate != nil {
		setClauses = append(setClauses, "purchase_date = ?")
		args = append(args, *input.PurchaseDate)
	}
	if input.SalePrice != nil {
		setClauses = append(setClauses, "sale_price = ?")
		args = append(args, *input.SalePrice)
	}
	if input.Note != nil {
		setClauses = append(setClauses, "note = ?")
		args = append(args, *input.Note)
	}
	if input.Details != nil {
		setClauses = append(setClauses, "details = ?")
		args = append(args, *input.Details)
	}

	if input.SellerName != nil {
		setClauses = append(setClauses, "seller_name = ?")
		args = append(args, *input.SellerName)
	}
	if input.SellerPhone != nil {
		setClauses = append(setClauses, "seller_phone = ?")
		args = append(args, *input.SellerPhone)
	}
	if input.SellerID != nil {
		setClauses = append(setClauses, "seller_id_number = ?")
		args = append(args, *input.SellerID)
	}

	if len(setClauses) == 0 {
		return nil
	}

	query := "UPDATE phones SET " + strings.Join(setClauses, ", ") + " WHERE id = ? AND import_by = ?"
	args = append(args, id, userID)

	_, err := r.DB.Exec(query, args...)
	return err
}

func (r *PhoneRepo) UpdateStatus(id int, status string) error {
	query := `UPDATE phones SET status = ?, updated_at = NOW() WHERE id = ?`
	_, err := r.DB.Exec(query, status, id)
	return err
}

func (r *PhoneRepo) MarkAsSold(id int, salePrice int64, saleDate time.Time) error {
	query := `UPDATE phones SET status = 'SOLD', sale_date = ?, updated_at = NOW() WHERE id = ?`
	_, err := r.DB.Exec(query, saleDate, id)
	return err
}

func (r *PhoneRepo) RevertToInStock(id int) error {
	query := `UPDATE phones SET status = 'IN_STOCK', sale_date = NULL, updated_at = NOW() WHERE id = ?`
	_, err := r.DB.Exec(query, id)
	return err
}

func (r *PhoneRepo) GetDailySaleStats(userID int) (int, int64, error) {
	var count int
	var revenue int64

	// Đếm số lượng máy bán
	queryCount := `
		SELECT COUNT(p.id) 
		FROM phones p
		JOIN invoice_items ii ON p.id = ii.phone_id AND ii.item_type = 'PHONE'
		JOIN invoices i ON ii.invoice_id = i.id
		WHERE p.import_by = ? 
		  AND p.status = 'SOLD'
		  AND i.type = 'SALE'
		  AND i.status = 'PAID'
		  AND DATE(p.sale_date) = CURDATE()
	`
	if err := r.DB.Get(&count, queryCount, userID); err != nil {
		return 0, 0, err
	}

	// Tính tổng doanh thu
	queryRevenue := `
		SELECT COALESCE(SUM(p.sale_price), 0)
		FROM phones p
		JOIN invoice_items ii ON p.id = ii.phone_id AND ii.item_type = 'PHONE'
		JOIN invoices i ON ii.invoice_id = i.id
		WHERE p.import_by = ? 
		  AND p.status = 'SOLD'
		  AND i.type = 'SALE'
		  AND i.status = 'PAID'
		  AND DATE(p.sale_date) = CURDATE()
	`
	if err := r.DB.Get(&revenue, queryRevenue, userID); err != nil {
		return 0, 0, err
	}

	return count, revenue, nil
}

func (r *PhoneRepo) GetInventoryStats(userID int) (int, int64, error) {
	var count int
	var inventoryValue int64

	// Đếm số máy tồn kho (đã thanh toán hoá đơn nhập)
	queryCount := `
		SELECT COUNT(p.id) 
		FROM phones p
		JOIN invoice_items ii ON p.id = ii.phone_id AND ii.item_type = 'PHONE'
		JOIN invoices i ON ii.invoice_id = i.id
		WHERE p.import_by = ? 
		  AND p.status = 'IN_STOCK'
		  AND i.type = 'IMPORT'
		  AND i.status = 'PAID'
	`
	if err := r.DB.Get(&count, queryCount, userID); err != nil {
		return 0, 0, err
	}

	// Tính tổng giá trị tồn kho (Tổng vốn đang nằm trong kho)
	queryValue := `
		SELECT COALESCE(SUM(p.purchase_price), 0)
		FROM phones p
		JOIN invoice_items ii ON p.id = ii.phone_id AND ii.item_type = 'PHONE'
		JOIN invoices i ON ii.invoice_id = i.id
		WHERE p.import_by = ? 
		  AND p.status = 'IN_STOCK'
		  AND i.type = 'IMPORT'
		  AND i.status = 'PAID'
	`
	if err := r.DB.Get(&inventoryValue, queryValue, userID); err != nil {
		return 0, 0, err
	}

	return count, inventoryValue, nil
}
