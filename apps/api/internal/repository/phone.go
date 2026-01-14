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

func (r *PhoneRepo) GetByIMEI(imei string) (*model.Phone, error) {
	var phone model.Phone
	query := `SELECT * FROM phones WHERE imei = ? LIMIT 1`
	err := r.DB.Get(&phone, query, imei)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &phone, err
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

// Sửa tên hàm GetAll -> GetByUserID và thêm tham số userID
func (r *PhoneRepo) GetByUserID(userID, page, limit int) ([]model.Phone, int, float64, error) {
	var phones []model.Phone
	var total int
	var totalValue float64

	offset := (page - 1) * limit

	// 1. Lấy danh sách (Có phân trang)
	query := `
		SELECT p.*, u.full_name as importer_name 
		FROM phones p
		LEFT JOIN users u ON p.import_by = u.id
		WHERE p.import_by = ?
		ORDER BY p.created_at DESC
		LIMIT ? OFFSET ?
	`

	err := r.DB.Select(&phones, query, userID, limit, offset)
	if err != nil {
		return nil, 0, 0, err
	}

	// 2. Đếm tổng số bản ghi (Để FE tính số trang)
	countQuery := `SELECT COUNT(*) FROM phones WHERE import_by = ?`
	err = r.DB.Get(&total, countQuery, userID)
	if err != nil {
		return nil, 0, 0, err
	}

	// 3. Tính tổng giá trị (Sum)
	// COALESCE để tránh lỗi NULL nếu kho rỗng
	sumQuery := `SELECT COALESCE(SUM(purchase_price), 0) FROM phones WHERE import_by = ?`
	err = r.DB.Get(&totalValue, sumQuery, userID)
	if err != nil {
		return nil, 0, 0, err
	}

	return phones, total, totalValue, nil
}
