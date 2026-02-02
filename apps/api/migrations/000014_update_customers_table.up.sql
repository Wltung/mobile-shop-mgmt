-- Đảm bảo bảng customers có cấu trúc đúng theo tài liệu nghiệp vụ
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL, -- Họ tên là bắt buộc để định danh
    phone VARCHAR(50) NULL,     -- SĐT có thể null (nếu dùng CCCD)
    id_number VARCHAR(50) NULL, -- CCCD có thể null (nếu dùng SĐT)
    created_by INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Index giúp tìm kiếm nhanh cho logic GetOrCreate
    INDEX idx_customer_identity (name, phone, id_number)
);