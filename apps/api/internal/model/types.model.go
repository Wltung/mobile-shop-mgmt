package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

// JSONMap là kiểu dữ liệu tùy chỉnh để map cột JSON trong MySQL
type JSONMap map[string]interface{}

// Value: Biến đổi Map -> JSON String (để lưu vào DB)
func (a JSONMap) Value() (driver.Value, error) {
	return json.Marshal(a)
}

// Scan: Biến đổi JSON String (từ DB) -> Map (để dùng trong Code)
func (a *JSONMap) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(b, &a)
}
