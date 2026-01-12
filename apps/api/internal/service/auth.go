package service

import (
	"api/internal/config"
	"api/internal/model"
	"api/internal/repository"
	"errors"
	"time"

	"crypto/rand"
	"encoding/hex"
	"fmt"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	Repo   *repository.UserRepo
	Config *config.Config
}

func NewAuthService(repo *repository.UserRepo, cfg *config.Config) *AuthService {
	return &AuthService{Repo: repo, Config: cfg}
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
		role = "staff"
	}

	return s.Repo.Create(model.User{
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
	tokenDuration := time.Hour * 24 // Mặc định 1 ngày
	if input.RememberMe {
		tokenDuration = time.Hour * 24 * 7 // Nếu chọn Remember Me -> 7 ngày
	}

	// Tạo Token
	token, err := s.generateJWT(user, tokenDuration)
	if err != nil {
		return "", nil, err
	}

	return token, user, nil
}

func (s *AuthService) generateJWT(u *model.User, duration time.Duration) (string, error) {
	claims := jwt.MapClaims{
		"sub":  u.ID,
		"role": u.Role,
		// Sử dụng tham số duration được truyền vào thay vì fix cứng 24h
		"exp": time.Now().Add(duration).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.Config.JWTSecret))
}

// Xử lý yêu cầu quên mật khẩu
func (s *AuthService) ForgotPassword(input model.ForgotPasswordInput) error {
	// Kiểm tra email có tồn tại không
	user, err := s.Repo.GetByEmail(input.Email)
	if err != nil {
		return err
	}
	if user == nil {
		// Bảo mật: Không nên báo "Email không tồn tại", cứ báo thành công giả hoặc lỗi chung
		// Nhưng để dev dễ debug thì cứ return lỗi
		return errors.New("Email không tồn tại trong hệ thống")
	}

	// Tạo Token ngẫu nhiên (32 bytes -> hex string)
	token, err := s.generateRandomToken(32)
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

	// TODO: Gửi Email thật ở đây.
	// Hiện tại: In ra console để test
	fmt.Printf(">>> MOCK EMAIL: Link reset password: http://localhost:3000/reset-password?token=%s\n", token)

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

// Hàm phụ: Sinh chuỗi ngẫu nhiên
func (s *AuthService) generateRandomToken(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
