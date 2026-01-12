package main

import (
	"api/internal/config" // 1. Import config
	"api/internal/db"     // 2. Import db
	"api/internal/http/handler"
	"api/internal/http/router"
	"api/internal/repository"
	"api/internal/service"
)

func main() {
	// 1. Load Config & DB
	cfg := config.LoadConfig()
	db.RunMigrations(cfg)
	dbConn := db.Connect(cfg)

	// 2. Init Auth Module
	userRepo := repository.NewUserRepo(dbConn)
	authService := service.NewAuthService(userRepo, cfg)
	authHandler := handler.NewAuthHandler(authService, cfg)

	// 3. Init Phone Module
	phoneRepo := repository.NewPhoneRepo(dbConn)
	phoneService := service.NewPhoneService(phoneRepo)
	phoneHandler := handler.NewPhoneHandler(phoneService)

	// 4. Init Router (Giao việc định tuyến cho package router)
	r := router.NewRouter(cfg, authHandler, phoneHandler)

	// 5. Start Server
	r.Run(":" + cfg.ServerPort)
}
