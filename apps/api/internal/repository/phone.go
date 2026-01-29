package repository

import (
	"api/internal/model"
	"database/sql"
	"strings"

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
		INSERT INTO phones (imei, model_name, details, status, purchase_price, sale_price, purchase_date, note, import_by, source_id)
		VALUES (:imei, :model_name, :details, :status, :purchase_price, :sale_price, :purchase_date, :note, :import_by, :source_id)
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
	if err != nil {
		return nil, err
	}
	return &phone, nil
}

// Lấy toàn bộ danh sách điện thoại (Mới nhất lên đầu)
func (r *PhoneRepo) GetAll() ([]model.Phone, error) {
	var phones []model.Phone
	// Left Join để lỡ user bị xóa thì vẫn hiện phone
	query := `
		SELECT p.*, u.full_name as importer_name 
		FROM phones p
		LEFT JOIN users u ON p.import_by = u.id
		ORDER BY p.created_at DESC
	`

	err := r.DB.Select(&phones, query)
	if err != nil {
		return nil, err
	}
	return phones, nil
}

// Hàm nội bộ: Chạy Count, Sum và Select dựa trên baseQuery đã build
func (r *PhoneRepo) fetchList(
	baseQuery string,
	args []interface{},
	sumCol string, // Cột để tính tổng (VD: p.purchase_price)
	selectClause string, // Câu lệnh SELECT các trường cụ thể
	orderBy string, // Câu lệnh ORDER BY
	limit, offset int,
) ([]model.Phone, int, float64, error) {
	var phones []model.Phone
	var totalCount int
	var totalValue float64

	// 1. Query Đếm
	countQuery := "SELECT COUNT(*) " + baseQuery
	if err := r.DB.Get(&totalCount, countQuery, args...); err != nil {
		return nil, 0, 0, err
	}

	// 2. Query Tổng tiền
	sumQuery := "SELECT COALESCE(SUM(" + sumCol + "), 0) " + baseQuery
	if err := r.DB.Get(&totalValue, sumQuery, args...); err != nil {
		return nil, 0, 0, err
	}

	// 3. Query Lấy dữ liệu (Phân trang)
	fullQuery := selectClause + " " + baseQuery + " ORDER BY " + orderBy + " LIMIT ? OFFSET ?"

	// Append limit/offset vào args để chạy query cuối
	queryArgs := append(args, limit, offset)

	if err := r.DB.Select(&phones, fullQuery, queryArgs...); err != nil {
		return nil, 0, 0, err
	}

	return phones, totalCount, totalValue, nil
}

// 1. HAM CHO QUẢN LÝ NHẬP (Kho hàng tổng hợp)
func (r *PhoneRepo) GetImports(userID int, filter model.PhoneFilter) ([]model.Phone, int, float64, error) {
	// --- A. Build Query ---
	baseQuery := `
		FROM phones p 
		LEFT JOIN users u ON p.import_by = u.id 
		LEFT JOIN customers c ON p.source_id = c.id
		WHERE p.import_by = ?
	`
	args := []interface{}{userID}

	if filter.Keyword != "" {
		baseQuery += " AND (p.imei LIKE ? OR p.model_name LIKE ?)"
		likeStr := "%" + filter.Keyword + "%"
		args = append(args, likeStr, likeStr)
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

	// --- B. Config & Execute ---
	selectClause := `
		SELECT p.*, 
		u.full_name as importer_name,
		c.name as seller_name, 
		c.phone as seller_phone
	`
	// Sắp xếp ưu tiên ngày nhập
	orderBy := "p.purchase_date DESC, p.created_at DESC"
	offset := (filter.Page - 1) * filter.Limit

	// Gọi hàm chung
	return r.fetchList(baseQuery, args, "p.purchase_price", selectClause, orderBy, filter.Limit, offset)
}

// 2. HAM CHO LỊCH SỬ BÁN HÀNG (Chỉ lấy máy đã bán)
func (r *PhoneRepo) GetSales(userID int, filter model.PhoneFilter) ([]model.Phone, int, float64, error) {
	// --- A. Build Query ---
	baseQuery := `
		FROM phones p 
        -- [SỬA] Dùng JOIN (Inner Join) để chỉ lấy item thuộc hoá đơn Bán
        -- Item của hoá đơn Nhập sẽ bị loại bỏ tại đây vì inv.type != 'SALE'
        JOIN invoice_items ii ON p.id = ii.phone_id
        JOIN invoices inv ON ii.invoice_id = inv.id AND inv.type = 'SALE'
        
        LEFT JOIN customers c_buy ON inv.customer_id = c_buy.id
        WHERE p.import_by = ? AND p.status = 'SOLD'
	`
	args := []interface{}{userID}

	if filter.Keyword != "" {
		baseQuery += " AND (p.imei LIKE ? OR p.model_name LIKE ? OR c_buy.name LIKE ?)"
		likeStr := "%" + filter.Keyword + "%"
		args = append(args, likeStr, likeStr, likeStr)
	}
	// Filter Status
	if filter.Status != "" && filter.Status != "ALL" {
		baseQuery += " AND inv.status = ?"
		args = append(args, filter.Status)
	}
	// Filter theo ngày bán
	if filter.StartDate != "" && filter.EndDate != "" {
		baseQuery += " AND DATE(p.sale_date) BETWEEN ? AND ?"
		args = append(args, filter.StartDate, filter.EndDate)
	}

	// --- B. Config & Execute ---
	selectClause := `
		SELECT p.*, 
		c_buy.name as buyer_name, 
		inv.status as invoice_status,
		inv.id as invoice_id,
		inv.invoice_code as invoice_code
	`
	orderBy := "p.sale_date DESC, inv.created_at DESC"
	offset := (filter.Page - 1) * filter.Limit

	// Gọi hàm chung (Lưu ý tính tổng theo sale_price)
	return r.fetchList(baseQuery, args, "p.sale_price", selectClause, orderBy, filter.Limit, offset)
}

// GetByID: Lấy chi tiết máy theo ID và UserID (để bảo mật data)
func (r *PhoneRepo) GetByID(id, userID int) (*model.Phone, error) {
	var phone model.Phone

	// SQL Query: JOIN để lấy tên người nhập (users) và thông tin khách bán (customers)
	query := `
		SELECT 
			p.*, 
			COALESCE(u.full_name, 'Unknown') as importer_name,
			c.name as seller_name,
			c.phone as seller_phone,
			c.id_number as seller_id,
			inv.invoice_code as invoice_code,  -- Lấy thêm cột này
			inv.id as invoice_id,
			inv.status as invoice_status
		FROM phones p
		LEFT JOIN users u ON p.import_by = u.id
		LEFT JOIN customers c ON p.source_id = c.id
		
		-- JOIN tìm hoá đơn nhập
		LEFT JOIN invoice_items ii ON p.id = ii.phone_id AND ii.item_type = 'PHONE'
		LEFT JOIN invoices inv ON ii.invoice_id = inv.id AND inv.type = 'IMPORT'

		WHERE p.id = ? AND p.import_by = ?
		LIMIT 1
	`

	// Dùng r.DB.Get của sqlx để map thẳng vào struct Phone
	err := r.DB.Get(&phone, query, id, userID)
	if err != nil {
		return nil, err // Trả về lỗi (ví dụ: sql.ErrNoRows nếu không tìm thấy)
	}

	return &phone, nil
}

// UpdateDynamic: Chỉ update các trường có giá trị (không nil)
func (r *PhoneRepo) UpdateDynamic(id int, userID int, input model.PhoneUpdateInput, newSourceID *int) error {
	// 1. Xây dựng câu query động
	setClauses := []string{}
	args := []interface{}{}

	// Luôn update thời gian sửa
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
		args = append(args, *input.Details) // sqlx tự handle JSONMap Value()
	}

	// Nếu logic service xác định có thay đổi SourceID (người bán)
	// newSourceID là pointer int, nếu service truyền vào nil nghĩa là không đổi source
	// Nhưng ở đây ta cần cẩn thận: Service sẽ quyết định passed vào value nào.
	// Tạm thời quy ước: Nếu Service tính toán ra SourceID mới, nó sẽ truyền vào.
	if newSourceID != nil {
		setClauses = append(setClauses, "source_id = ?")
		args = append(args, *newSourceID)
	}

	// Nếu không có gì để update thì return luôn
	if len(setClauses) == 0 {
		return nil
	}

	query := "UPDATE phones SET " + strings.Join(setClauses, ", ") + " WHERE id = ? AND import_by = ?"
	args = append(args, id, userID)

	_, err := r.DB.Exec(query, args...)
	return err
}
