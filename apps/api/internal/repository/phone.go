package repository

import (
	"api/internal/model"
	"database/sql"

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
		INSERT INTO phones (imei, model_name, details, status, purchase_price, purchase_date, note, import_by, source_id)
		VALUES (:imei, :model_name, :details, :status, :purchase_price, :purchase_date, :note, :import_by, :source_id)
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

func (r *PhoneRepo) GetList(userID int, filter model.PhoneFilter) ([]model.Phone, int, float64, error) {
	var phones []model.Phone
	var totalCount int
	var totalValue float64

	// 1. Xây dựng câu Query động
	baseQuery := "FROM phones p LEFT JOIN users u ON p.import_by = u.id WHERE p.import_by = ?"
	args := []interface{}{userID}

	// Filter: Keyword (IMEI hoặc Model Name)
	if filter.Keyword != "" {
		baseQuery += " AND (p.imei LIKE ? OR p.model_name LIKE ?)"
		likeStr := "%" + filter.Keyword + "%"
		args = append(args, likeStr, likeStr)
	}

	// Filter: Status
	if filter.Status != "" && filter.Status != "ALL" {
		baseQuery += " AND p.status = ?"
		args = append(args, filter.Status)
	}

	// Filter: Date Range (Created At)
	if filter.StartDate != "" && filter.EndDate != "" {
		// Dùng DATE() để chỉ so sánh ngày, bỏ qua giờ phút
		baseQuery += " AND DATE(p.created_at) BETWEEN ? AND ?"
		args = append(args, filter.StartDate, filter.EndDate)
	}

	// 2. Query Đếm & Tổng tiền (Chạy trước khi LIMIT)
	countQuery := "SELECT COUNT(*) " + baseQuery
	sumQuery := "SELECT COALESCE(SUM(p.purchase_price), 0) " + baseQuery

	err := r.DB.Get(&totalCount, countQuery, args...)
	if err != nil {
		return nil, 0, 0, err
	}
	err = r.DB.Get(&totalValue, sumQuery, args...)
	if err != nil {
		return nil, 0, 0, err
	}

	// 3. Query Lấy dữ liệu (Thêm Sort & Pagination)
	// Lưu ý: LIMIT/OFFSET phải nằm cuối cùng
	selectQuery := `SELECT p.*, u.full_name as importer_name ` + baseQuery + ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`

	offset := (filter.Page - 1) * filter.Limit
	args = append(args, filter.Limit, offset)

	err = r.DB.Select(&phones, selectQuery, args...)
	if err != nil {
		return nil, 0, 0, err
	}

	return phones, totalCount, totalValue, nil
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
			c.id_number as seller_id_number,
			inv.invoice_code as invoice_code  -- Lấy thêm cột này
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

func (r *PhoneRepo) Update(p model.Phone) error {
	// Chỉ cho phép update các trường thông tin, không cho sửa ID hay ngày tạo
	query := `
		UPDATE phones 
		SET 
			imei = :imei, 
			model_name = :model_name, 
			status = :status, 
			purchase_price = :purchase_price, 
			note = :note, 
			details = :details,
			source_id = :source_id,
			import_date = :import_date,  -- Nếu bạn có cột này (hoặc purchase_date)
			updated_at = NOW()
		WHERE id = :id AND import_by = :import_by
	`

	// NamedExec tự động map các field từ struct vào query
	_, err := r.DB.NamedExec(query, p)
	return err
}
