-- 1. Thêm cột invoice_code (Cho phép NULL trước để xử lý data cũ nếu có)
ALTER TABLE invoices 
ADD COLUMN invoice_code VARCHAR(50) AFTER ID;

-- 2. Cập nhật mã cho các hóa đơn cũ (nếu có data) để tránh lỗi Unique
-- Format tạm: OLD-{ID}
UPDATE invoices 
SET invoice_code = CONCAT('OLD-', id) 
WHERE invoice_code IS NULL;

-- 3. Ràng buộc NOT NULL và UNIQUE
ALTER TABLE invoices 
MODIFY COLUMN invoice_code VARCHAR(50) NOT NULL;

CREATE UNIQUE INDEX idx_invoices_code ON invoices(invoice_code);