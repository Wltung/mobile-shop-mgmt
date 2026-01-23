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

func (r *CustomerRepo) GetByID(id, userID int) (*model.Customer, error) {
	var c model.Customer
	query := `
		SELECT id, name, phone, id_number, created_by, created_at
		FROM customers
		WHERE id = ? AND created_by = ?
		LIMIT 1
	`
	err := r.DB.Get(&c, query, id, userID)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &c, nil
}

// Tìm khách hàng theo SĐT hoặc CCCD
func (r *CustomerRepo) GetMatchCustomer(name, phone, idNumber string, userID int) (*model.Customer, error) {
	if name == "" {
		return nil, nil
	}

	// Ưu tiên CCCD
	if idNumber != "" {
		var c model.Customer
		err := r.DB.Get(&c,
			`SELECT id, name, phone, id_number, created_by, created_at
			FROM customers
			WHERE name = ? AND id_number = ? AND created_by = ?
			LIMIT 1`,
			name, idNumber, userID,
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
			`SELECT id, name, phone, id_number, created_by, created_at
			FROM customers
			WHERE name = ? AND phone = ? AND created_by = ?
			LIMIT 1`,
			name, phone, userID,
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
	query := `
		INSERT INTO customers (name, phone, id_number, created_by) 
		VALUES (:name, :phone, :id_number, :created_by)
	`
	result, err := r.DB.NamedExec(query, c)
	if err != nil {
		return 0, err
	}
	id, err := result.LastInsertId()
	return int(id), err
}

func (r *CustomerRepo) Update(c model.Customer) error {
	query := `
		UPDATE customers 
		SET 
			name = :name, 
			phone = :phone, 
			id_number = :id_number,
			updated_at = NOW()
		WHERE id = :id AND created_by = :created_by
	`
	_, err := r.DB.NamedExec(query, c)
	return err
}
