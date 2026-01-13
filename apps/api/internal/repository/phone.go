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

func (r *PhoneRepo) Create(p model.Phone) error {
	query := `
		INSERT INTO phones (imei, model_name, details, status, purchase_price, purchase_date, note, import_by)
		VALUES (:imei, :model_name, :details, :status, :purchase_price, :purchase_date, :note, :import_by)
	`
	_, err := r.DB.NamedExec(query, p)
	return err
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
func (r *PhoneRepo) GetByUserID(userID int) ([]model.Phone, error) {
	var phones []model.Phone
	query := `
		SELECT p.*, u.full_name as importer_name 
		FROM phones p
		LEFT JOIN users u ON p.import_by = u.id
		WHERE p.import_by = ?  -- THÊM DÒNG NÀY ĐỂ LỌC THEO USER
		ORDER BY p.created_at DESC
	`

	// Truyền userID vào query
	err := r.DB.Select(&phones, query, userID)
	if err != nil {
		return nil, err
	}
	return phones, nil
}
