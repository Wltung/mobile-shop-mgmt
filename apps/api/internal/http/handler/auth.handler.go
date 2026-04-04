package handler

import (
	"api/internal/config"
	"api/internal/model"
	"api/internal/service"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	Service *service.AuthService
	Config  *config.Config
}

func NewAuthHandler(s *service.AuthService, cfg *config.Config) *AuthHandler {
	return &AuthHandler{Service: s, Config: cfg}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var input model.RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.Service.Register(input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Đăng ký thành công"})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var input model.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token, user, err := h.Service.Login(input)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	// TÍNH TOÁN THỜI GIAN COOKIE (GIÂY)
	maxAge := 3600 // 1 tiếng
	if input.RememberMe {
		maxAge = 3600 * 24 // 1 ngày
	}

	// --- SET COOKIE HTTPONLY ---
	// Chỉ bật Secure (https) khi AppEnv là 'production'
	isSecure := false
	if h.Config.AppEnv == "production" {
		isSecure = true
	}
	// Cú pháp: SetCookie(name, value, maxAge, path, domain, secure, httpOnly)
	c.SetCookie(
		"access_token", // Tên cookie
		token,          // Giá trị (JWT)
		maxAge,         // Thời gian sống (giây)
		"/",            // Path (toàn bộ site)
		"",             // Domain (để trống là localhost)
		isSecure,       // Secure: Để false khi chạy localhost (http), lên Production (https) phải đổi thành true
		true,           // HttpOnly: QUAN TRỌNG -> JavaScript không đọc được
	)

	// Trả về User info (KHÔNG TRẢ VỀ TOKEN TRONG JSON NỮA)
	c.JSON(http.StatusOK, gin.H{
		"message": "Đăng nhập thành công",
		"user":    user,
	})
}

// Hàm Logout để xóa Cookie và Thu hồi Token
func (h *AuthHandler) Logout(c *gin.Context) {
	// 1. Bắt Token do Middleware vừa kiểm tra xong truyền sang
	rawToken := c.GetString("rawToken")
	expiresAt, exists := c.Get("expiresAt")

	// 2. Đưa vào Blacklist DB
	if rawToken != "" && exists {
		errDB := h.Service.Repo.BlacklistToken(rawToken, expiresAt.(time.Time))
		if errDB != nil {
			fmt.Println("❌ LỖI INSERT BLACKLIST:", errDB)
		} else {
			fmt.Println("✅ ĐÃ ĐƯA TOKEN VÀO BLACKLIST!")
		}
	} else {
		fmt.Println("⚠️ KHÔNG TÌM THẤY TOKEN TỪ MIDDLEWARE CHUYỀN SANG")
	}

	// 3. Xóa cookie ở Browser
	c.SetCookie("access_token", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Đã đăng xuất và vô hiệu hóa token an toàn"})
}

// API: POST /api/forgot-password
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var input model.ForgotPasswordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.Service.ForgotPassword(input); err != nil {
		// Trong thực tế nên trả về 200 dù email có tồn tại hay không để tránh user enumeration
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Vui lòng kiểm tra email để lấy lại mật khẩu."})
}

// API: POST /api/reset-password
func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var input model.ResetPasswordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.Service.ResetPassword(input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại."})
}
