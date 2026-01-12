package db

import (
	"api/internal/config"
	"fmt"
	"log"

	// Import package config

	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
)

// Init nhận vào pointer config
func Connect(cfg *config.Config) *sqlx.DB {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true&loc=Local",
		cfg.DBUser,
		cfg.DBPassword,
		cfg.DBHost,
		cfg.DBPort,
		cfg.DBName,
	)

	conn, err := sqlx.Connect("mysql", dsn)
	if err != nil {
		log.Fatalln("Lỗi kết nối MySQL:", err)
	}

	log.Println("Kết nối Database thành công!")
	return conn
}
