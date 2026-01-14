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
	invoiceHandler *handler.InvoiceHandler,
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

		// API Logout
		api.POST("/logout", authHandler.Logout)

		// Protected Routes (Yêu cầu đăng nhập)
		protected := api.Group("/")
		protected.Use(middleware.Auth(cfg))
		{
			// Phone Routes
			protected.POST("/phones", phoneHandler.CreatePhone)
			protected.GET("/phones", phoneHandler.GetPhones)
			// Invoice Routes
			protected.POST("/invoices", invoiceHandler.CreateInvoice)
			protected.GET("/invoices/:id", invoiceHandler.GetInvoice)
		}
	}

	return r
}
