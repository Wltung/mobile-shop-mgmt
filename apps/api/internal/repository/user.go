package repository

import (
	"api/internal/model"
	"database/sql"
	"time"

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

// Lưu token reset password
func (r *UserRepo) CreatePasswordReset(userID int, token string, expiresAt time.Time) error {
	query := `INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)`
	_, err := r.DB.Exec(query, userID, token, expiresAt)
	return err
}

// Tìm thông tin từ token (Kiểm tra token có tồn tại và chưa hết hạn không)
func (r *UserRepo) GetUserByResetToken(token string) (*model.User, error) {
	var user model.User
	// Join bảng users để lấy thông tin user luôn
	query := `
		SELECT u.* FROM users u
		JOIN password_resets pr ON u.id = pr.user_id
		WHERE pr.token = ? AND pr.expires_at > NOW()
		LIMIT 1
	`
	err := r.DB.Get(&user, query, token)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &user, err
}

// Xóa token sau khi dùng xong (hoặc xóa tất cả token của user đó)
func (r *UserRepo) DeleteResetTokens(userID int) error {
	query := `DELETE FROM password_resets WHERE user_id = ?`
	_, err := r.DB.Exec(query, userID)
	return err
}

// Cập nhật mật khẩu mới
func (r *UserRepo) UpdatePassword(userID int, hashedPassword string) error {
	query := `UPDATE users SET password_hash = ? WHERE id = ?`
	_, err := r.DB.Exec(query, hashedPassword, userID)
	return err
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

func (r *UserRepo) GetByUsernameOrEmail(loginValue string) (*model.User, error) {
	var user model.User
	// Câu lệnh SQL kiểm tra cả 2 cột
	query := `SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1`

	// Truyền loginValue vào cả 2 dấu hỏi (?)
	err := r.DB.Get(&user, query, loginValue, loginValue)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &user, err
}
