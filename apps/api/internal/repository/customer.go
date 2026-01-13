package repository

import (
	"api/internal/model"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

type CustomerRepo struct {
	DB *sqlx.DB
}

func NewCustomerRepo(db *sqlx.DB) *CustomerRepo {
	return &CustomerRepo{DB: db}
}

// Tìm khách hàng theo SĐT hoặc CCCD
func (r *CustomerRepo) GetByPhoneOrIdentity(phone, idNumber string) (*model.Customer, error) {

	// Ưu tiên CCCD
	if idNumber != "" {
		var c model.Customer
		err := r.DB.Get(&c,
			`SELECT id, name, phone, id_number, created_at
			FROM customers
			WHERE id_number = ?
			LIMIT 1`,
			idNumber,
		)

		if err == nil {
			return &c, nil
		}
		if err != sql.ErrNoRows {
			return nil, err
		}
	}

	// Fallback SĐT
	if phone != "" {
		var c model.Customer
		err := r.DB.Get(&c,
			`SELECT id, name, phone, id_number, created_at
			FROM customers
			WHERE phone = ?
			LIMIT 1`,
			phone,
		)

		if err == nil {
			return &c, nil
		}
		if err != sql.ErrNoRows {
			return nil, err
		}
	}

	return nil, nil
}

// Tạo khách hàng mới
func (r *CustomerRepo) Create(c model.Customer) (int, error) {
	query := `INSERT INTO customers (name, phone, id_number) VALUES (:name, :phone, :id_number)`
	result, err := r.DB.NamedExec(query, c)
	if err != nil {
		return 0, err
	}
	id, err := result.LastInsertId()
	return int(id), err
}
