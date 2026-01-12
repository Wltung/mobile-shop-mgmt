package router

import (
	"api/internal/config"
	"api/internal/http/handler"
	"api/internal/http/middleware"

	"github.com/gin-gonic/gin"
)

// NewRouter nhận vào Config và tất cả các Handler cần thiết
func NewRouter(
	cfg *config.Config,
	authHandler *handler.AuthHandler,
	phoneHandler *handler.PhoneHandler,
) *gin.Engine {
	r := gin.Default()

	// 1. Setup CORS (Rất quan trọng cho Next.js gọi sang)
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", cfg.FrontendOrigin)
		// 2. Bắt buộc phải có dòng này để trình duyệt cho phép gửi Cookie
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	api := r.Group("/api")
	{
		// Public Routes
		api.POST("/register", authHandler.Register)
		api.POST("/login", authHandler.Login)

		// API Forgot password
		api.POST("/forgot-password", authHandler.ForgotPassword)
		api.POST("/reset-password", authHandler.ResetPassword)

		// Protected Routes (Yêu cầu đăng nhập)
		protected := api.Group("/")
		protected.Use(middleware.Auth(cfg))
		{
			protected.POST("/phones", phoneHandler.CreatePhone)
			// Sau này thêm các route cần bảo vệ vào đây
		}
	}

	return r
}
