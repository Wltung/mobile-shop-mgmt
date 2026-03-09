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
	repairHandler *handler.RepairHandler,
	warrantyHandler *handler.WarrantyHandler,
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
			phones := protected.Group("phones")
			{
				phones.POST("", phoneHandler.CreatePhone)
				phones.GET("", phoneHandler.GetImportPhones)
				phones.GET("/sales", phoneHandler.GetSalePhones)
				phones.GET("/:id", phoneHandler.GetPhoneDetail)
				phones.PATCH("/:id", phoneHandler.UpdatePhone)
			}
			// Invoice Routes
			invoices := protected.Group("/invoices")
			{
				invoices.POST("", invoiceHandler.CreateInvoice)
				invoices.GET("/:id", invoiceHandler.GetInvoice)
				invoices.GET("", invoiceHandler.GetInvoices)
				invoices.PATCH("/:id/status", invoiceHandler.UpdateInvoiceStatus)
				invoices.PATCH("/:id", invoiceHandler.UpdateInvoice)
			}
			// Repair Routes
			repairs := protected.Group("/repairs")
			{
				repairs.POST("", repairHandler.CreateRepair)
				repairs.GET("", repairHandler.GetRepairs)
				repairs.GET("/:id", repairHandler.GetRepair)
				repairs.PATCH("/:id", repairHandler.UpdateRepair)
				repairs.POST("/:id/complete", repairHandler.CompleteRepair)
			}
			warranties := protected.Group("/warranties")
			{
				warranties.GET("", warrantyHandler.GetAll)
				warranties.POST("", warrantyHandler.Create)
				warranties.GET("/:id", warrantyHandler.GetByID)
				warranties.GET("/search", warrantyHandler.SearchEligible)
				warranties.PATCH("/:id", warrantyHandler.Update)
			}
		}
	}

	return r
}
