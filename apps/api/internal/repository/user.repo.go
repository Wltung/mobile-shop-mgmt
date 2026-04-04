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

func (r *UserRepo) CreateTenantAndUser(tenantName string, u model.User) error {
	// Dùng Transaction để nếu lỗi thì rollback cả 2
	tx, err := r.DB.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Tạo Tenant
	res, err := tx.Exec("INSERT INTO tenants (name, status) VALUES (?, 'ACTIVE')", tenantName)
	if err != nil {
		return err
	}
	tenantID, _ := res.LastInsertId()

	// 2. Gắn TenantID vào User và tạo User
	u.TenantID = int(tenantID)
	queryUser := `
		INSERT INTO users (tenant_id, username, email, password_hash, full_name, role) 
		VALUES (:tenant_id, :username, :email, :password_hash, :full_name, :role)
	`
	if _, err := tx.NamedExec(queryUser, u); err != nil {
		return err
	}

	return tx.Commit()
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

func (r *UserRepo) IsSpamming(userID int) (bool, error) {
	var count int
	// Kiểm tra xem có record nào của user này được tạo trong 60s vừa qua không
	// NOW() của MySQL sẽ so sánh với created_at của MySQL -> Cùng múi giờ
	query := `
        SELECT count(*) FROM password_resets 
        WHERE user_id = ? AND created_at > NOW() - INTERVAL 1 MINUTE
    `
	err := r.DB.Get(&count, query, userID)
	return count > 0, err
}

// Lưu token vào danh sách đen
func (r *UserRepo) BlacklistToken(token string, expiresAt time.Time) error {
	cleanQuery := `DELETE FROM blacklisted_tokens WHERE expires_at < NOW()`
	_, _ = r.DB.Exec(cleanQuery)

	query := `INSERT IGNORE INTO blacklisted_tokens (token, expires_at) VALUES (?, ?)`
	_, err := r.DB.Exec(query, token, expiresAt)
	return err
}

// Kiểm tra token có nằm trong danh sách đen không
func (r *UserRepo) IsTokenBlacklisted(token string) bool {
	var count int
	query := `SELECT count(*) FROM blacklisted_tokens WHERE token = ? LIMIT 1`
	err := r.DB.Get(&count, query, token)
	return count > 0 && err == nil
}
