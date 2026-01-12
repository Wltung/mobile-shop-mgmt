package service

import (
	"api/internal/config"
	"api/internal/model"
	"api/internal/repository"
	"errors"
	"time"

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
	if exists, _ := s.Repo.GetByEmail(input.Email); exists != nil {
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

func (s *AuthService) Login(input model.LoginInput) (*model.AuthResponse, error) {
	user, err := s.Repo.GetByUsername(input.Username)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("Sai tài khoản hoặc mật khẩu")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		return nil, errors.New("Sai tài khoản hoặc mật khẩu")
	}

	token, err := s.generateJWT(user)
	if err != nil {
		return nil, err
	}

	return &model.AuthResponse{Token: token, User: *user}, nil
}

func (s *AuthService) generateJWT(u *model.User) (string, error) {
	claims := jwt.MapClaims{
		"sub":  u.ID,
		"role": u.Role,
		"exp":  time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.Config.JWTSecret))
}
