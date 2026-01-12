package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config chứa toàn bộ cấu hình của App
type Config struct {
	DBUser     string
	DBPassword string
	DBHost     string
	DBPort     string
	DBName     string
	JWTSecret  string
	ServerPort string
}

// LoadConfig đọc file .env và nạp vào struct
func LoadConfig() *Config {
	// Load file .env (nếu có)
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: Không tìm thấy file .env, sẽ dùng biến môi trường hệ thống")
	}

	return &Config{
		DBUser:     getEnv("DB_USER", "root"),
		DBPassword: getEnv("DB_PASSWORD", ""),
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "3306"),
		DBName:     getEnv("DB_NAME", "mobile_shop"),
		JWTSecret:  getEnv("JWT_SECRET", "secret-mac-dinh-khi-dev"),
		ServerPort: getEnv("SERVER_PORT", "8080"),
	}
}

// Hàm phụ trợ để lấy biến môi trường hoặc giá trị mặc định
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
