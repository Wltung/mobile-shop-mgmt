package router

import (
	"api/internal/config"
	"api/internal/http/handler"
	"api/internal/http/middleware"

	"time"

	"github.com/gin-contrib/cors"
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

	// --- CẤU HÌNH CORS ---
	r.Use(cors.New(cors.Config{
		// Cho phép Frontend gọi vào (đổi port nếu FE bạn chạy port khác)
		AllowOrigins: []string{cfg.FrontendOrigin},

		// Các method được phép (QUAN TRỌNG: Phải có PATCH vì ta vừa thêm API Patch)
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},

		// Các Header được phép gửi lên
		AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},

		// Cho phép hiển thị các header này về client
		ExposeHeaders: []string{"Content-Length"},

		// Cho phép gửi cookie/token (quan trọng nếu dùng cookie)
		AllowCredentials: true,

		// Cache preflight request trong 12 giờ
		MaxAge: 12 * time.Hour,
	}))

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
			protected.GET("/phones", phoneHandler.GetImportPhones)
			protected.GET("/phones/sales", phoneHandler.GetSalePhones)
			protected.GET("/phones/:id", phoneHandler.GetPhoneDetail)
			protected.PATCH("/phones/:id", phoneHandler.UpdatePhone)
			// Invoice Routes
			protected.POST("/invoices", invoiceHandler.CreateInvoice)
			protected.GET("/invoices/:id", invoiceHandler.GetInvoice)
		}
	}

	return r
}
