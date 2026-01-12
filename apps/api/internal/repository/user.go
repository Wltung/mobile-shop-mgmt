package repository

import (
	"api/internal/model"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

type UserRepo struct {
	DB *sqlx.DB
}

func NewUserRepo(db *sqlx.DB) *UserRepo {
	return &UserRepo{DB: db}
}

func (r *UserRepo) Create(u model.User) error {
	query := `
		INSERT INTO users (username, email, password_hash, full_name, role) 
		VALUES (:username, :email, :password_hash, :full_name, :role)
	`
	_, err := r.DB.NamedExec(query, u)
	return err
}

func (r *UserRepo) GetByUsername(username string) (*model.User, error) {
	var user model.User
	query := `SELECT * FROM users WHERE username = ? LIMIT 1`
	err := r.DB.Get(&user, query, username)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &user, err
}

func (r *UserRepo) GetByEmail(email string) (*model.User, error) {
	var user model.User
	query := `SELECT * FROM users WHERE email = ? LIMIT 1`
	err := r.DB.Get(&user, query, email)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &user, err
}
