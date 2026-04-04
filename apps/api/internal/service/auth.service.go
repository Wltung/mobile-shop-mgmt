package service

import (
	"api/internal/auth"
	"api/internal/mailer"
	"api/internal/model"
	"api/internal/repository"

	"errors"
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	Repo         *repository.UserRepo
	TokenManager *auth.TokenManager
}

func NewAuthService(repo *repository.UserRepo, tokenMgr *auth.TokenManager) *AuthService {
	return &AuthService{
		Repo:         repo,
		TokenManager: tokenMgr,
	}
}

func (s *AuthService) Register(input model.RegisterInput) error {
	// 1. Check trùng Username
	exists, err := s.Repo.GetByUsername(input.Username)
	if err != nil {
		return err
	}

	if exists != nil {
		return errors.New("Username đã tồn tại")
	}

	// 2. Check trùng Email
	exists, err = s.Repo.GetByEmail(input.Email)
	if err != nil {
		return err
	}
	if exists != nil {
		return errors.New("Email này đã được sử dụng")
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	role := input.Role
	if role == "" {
		role = "admin"
	}

	tenantName := input.TenantName
	if tenantName == "" {
		tenantName = "Cửa hàng của " + input.FullName
	}

	// Gọi hàm tạo cả 2
	return s.Repo.CreateTenantAndUser(tenantName, model.User{
		Username:     input.Username,
		Email:        input.Email,
		PasswordHash: string(hashed),
		FullName:     input.FullName,
		Role:         role,
	})
}

func (s *AuthService) Login(input model.LoginInput) (string, *model.User, error) {
	// Tìm User
	user, err := s.Repo.GetByUsernameOrEmail(input.Username)
	if err != nil {
		return "", nil, err
	}
	if user == nil {
		return "", nil, errors.New("Sai tài khoản hoặc mật khẩu")
	}

	if !user.IsActive {
		return "", nil, errors.New("Tài khoản đã bị vô hiệu hóa")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		return "", nil, errors.New("Sai tài khoản hoặc mật khẩu")
	}

	// LOGIC REMEMBER ME:
	tokenDuration := time.Hour * 1 // Mặc định 1 tiếng
	if input.RememberMe {
		tokenDuration = time.Hour * 24 // Nếu chọn Remember Me -> 1 ngày
	}

	// Gọi TokenManager để tạo JWT
	token, err := s.TokenManager.GenerateJWT(user.ID, user.TenantID, user.Role, tokenDuration)
	if err != nil {
		return "", nil, err
	}

	return token, user, nil
}

// Xử lý yêu cầu quên mật khẩu
func (s *AuthService) ForgotPassword(input model.ForgotPasswordInput) error {
	// Kiểm tra email có tồn tại không
	user, err := s.Repo.GetByEmail(input.Email)
	if err != nil {
		return err
	}
	if user == nil {
		// Bảo mật: Báo thành công giả hoặc lỗi chung
		return errors.New("Email không đúng!")
	}

	// --- RATE LIMITING (CHỐNG SPAM) ---
	isSpam, err := s.Repo.IsSpamming(user.ID)
	if err != nil {
		return err
	}

	if isSpam {
		return errors.New("Thao tác quá nhanh. Vui lòng đợi 1 phút trước khi thử lại.")
	}

	// Gọi TokenManager để tạo Random Token
	token, err := s.TokenManager.GenerateRandomToken(32)
	if err != nil {
		return err
	}

	// Token hết hạn sau 15 phút
	expiresAt := time.Now().Add(15 * time.Minute)

	// Lưu vào DB
	_ = s.Repo.DeleteResetTokens(user.ID)
	if err := s.Repo.CreatePasswordReset(user.ID, token, expiresAt); err != nil {
		return err
	}

	// Gửi Email thật ở đây.
	err = mailer.SendResetPasswordEmail(user.Email, token)
	if err != nil {
		fmt.Println("❌ LỖI GỬI EMAIL:", err)
		return errors.New("Không thể gửi email lúc này. Vui lòng thử lại sau.")
	}

	return nil
}

// Xử lý đặt lại mật khẩu
func (s *AuthService) ResetPassword(input model.ResetPasswordInput) error {
	// Kiểm tra token có hợp lệ không
	user, err := s.Repo.GetUserByResetToken(input.Token)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("Token không hợp lệ hoặc đã hết hạn")
	}

	// Kiểm tra xem mật khẩu mới có trùng với mật khẩu cũ không
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.NewPassword))

	// Nếu err == nil nghĩa là khớp nhau (Trùng) -> Báo lỗi
	if err == nil {
		return errors.New("Mật khẩu mới không được trùng với mật khẩu cũ")
	}

	// Mã hóa mật khẩu mới
	hashedPass, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// Cập nhật mật khẩu vào DB
	if err := s.Repo.UpdatePassword(user.ID, string(hashedPass)); err != nil {
		return err
	}

	// Xóa token cũ để không dùng lại được nữa
	return s.Repo.DeleteResetTokens(user.ID)
}
