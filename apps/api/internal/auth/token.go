package auth

import (
	"crypto/rand"
	"encoding/hex"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// TokenManager chịu trách nhiệm quản lý sinh và verify token
type TokenManager struct {
	secretKey string
}

func NewTokenManager(secretKey string) *TokenManager {
	return &TokenManager{secretKey: secretKey}
}

// GenerateJWT tạo Access Token
func (m *TokenManager) GenerateJWT(userID int, role string, duration time.Duration) (string, error) {
	claims := jwt.MapClaims{
		"sub":  userID,
		"role": role,
		"exp":  time.Now().Add(duration).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(m.secretKey))
}

// GenerateRandomToken tạo chuỗi ngẫu nhiên (cho reset password, verify email...)
func (m *TokenManager) GenerateRandomToken(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
