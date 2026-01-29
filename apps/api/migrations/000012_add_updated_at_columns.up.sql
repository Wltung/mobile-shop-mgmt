-- Thêm cột updated_at cho bảng invoices
ALTER TABLE invoices 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Thêm cột updated_at cho bảng invoice_items
ALTER TABLE invoice_items 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Thêm cột updated_at cho bảng repairs
ALTER TABLE repairs 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Thêm cột updated_at cho bảng users
ALTER TABLE users 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;