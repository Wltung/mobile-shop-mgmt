package main

import (
	"api/internal/auth"
	"api/internal/config" // 1. Import config
	"api/internal/db"     // 2. Import db
	"api/internal/http/handler"
	"api/internal/http/router"
	"api/internal/repository"
	"api/internal/service"
)

func main() {
	// Load Config & DB
	cfg := config.LoadConfig()
	db.RunMigrations(cfg)
	dbConn := db.Connect(cfg)

	// Khởi tạo TokenManager
	tokenManager := auth.NewTokenManager(cfg.JWTSecret)

	// Repository
	userRepo := repository.NewUserRepo(dbConn)
	phoneRepo := repository.NewPhoneRepo(dbConn)
	customerRepo := repository.NewCustomerRepo(dbConn)
	invoiceRepo := repository.NewInvoiceRepo(dbConn)

	// Service
	customerService := service.NewCustomerService(customerRepo)
	phoneService := service.NewPhoneService(phoneRepo, customerService)
	authService := service.NewAuthService(userRepo, tokenManager)
	invoiceService := service.NewInvoiceService(invoiceRepo, customerService)

	// Handler
	authHandler := handler.NewAuthHandler(authService, cfg)
	phoneHandler := handler.NewPhoneHandler(phoneService)
	invoiceHandler := handler.NewInvoiceHandler(invoiceService)

	// Init Router (Giao việc định tuyến cho package router)
	r := router.NewRouter(cfg, authHandler, phoneHandler, invoiceHandler)

	// Start Server
	r.Run(":" + cfg.ServerPort)
}
