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
	query := `INSERT INTO phones (imei, model_name, details, purchase_price, status) 
			VALUES (:imei, :model_name, :details, :purchase_price, :status)`
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
