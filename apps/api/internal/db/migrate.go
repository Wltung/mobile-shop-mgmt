package db

import (
	"errors"
	"fmt"
	"log"

	"api/internal/config"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/mysql"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

// RunMigrations thực thi các file .sql trong thư mục migrations
func RunMigrations(cfg *config.Config) {
	// Tạo connection string dành riêng cho migrate (cần tham số multiStatements=true)
	// Lưu ý: Đảm bảo đường dẫn tới file migrations là chính xác (tương đối với nơi chạy lệnh go run)
	migrationURL := "file://migrations"
	databaseURL := fmt.Sprintf("mysql://%s:%s@tcp(%s:%s)/%s?multiStatements=true&parseTime=true",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName)

	m, err := migrate.New(migrationURL, databaseURL)
	if err != nil {
		log.Fatalf("Không thể khởi tạo migration: %v", err)
	}

	// Chạy lệnh UP
	if err := m.Up(); err != nil {
		if errors.Is(err, migrate.ErrNoChange) {
			log.Println("Database đã ở phiên bản mới nhất (No change)")
		} else {
			log.Fatalf("Lỗi khi chạy migration: %v", err)
		}
	} else {
		log.Println("Migration thành công!")
	}
}

func Rollback(cfg *config.Config) {
	migrationURL := "file://migrations"
	databaseURL := fmt.Sprintf("mysql://%s:%s@tcp(%s:%s)/%s?multiStatements=true&parseTime=true",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName)

	m, err := migrate.New(migrationURL, databaseURL)
	if err != nil {
		log.Fatalf("Không thể khởi tạo migration: %v", err)
	}

	// Lùi lại 1 bước (Undo file migration gần nhất)
	if err := m.Steps(-1); err != nil {
		log.Fatal("Rollback thất bại:", err)
	}
}
