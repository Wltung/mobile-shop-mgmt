-- 1. Thêm cột created_by (Link tới bảng Users)
ALTER TABLE customers 
ADD COLUMN created_by INT NOT NULL DEFAULT 1; -- Default 1 cho data cũ, sau này logic code sẽ ghi đè

-- 2. Tạo khóa ngoại
ALTER TABLE customers
ADD CONSTRAINT fk_customers_created_by
FOREIGN KEY (created_by) REFERENCES users(id)
ON DELETE RESTRICT;

-- 3. Xóa các index UNIQUE cũ (Global Unique)
-- Lưu ý: Kiểm tra tên index trong DB thật của bạn nếu lệnh DROP này lỗi
ALTER TABLE customers DROP INDEX phone;
ALTER TABLE customers DROP INDEX id_number;

-- 4. Tạo Index UNIQUE mới theo Scope (User + Phone/ID)
-- Cho phép Shop A và Shop B cùng có khách SĐT 09xx, nhưng trong 1 Shop thì không được trùng.
CREATE UNIQUE INDEX idx_customers_user_phone ON customers (created_by, phone);
CREATE UNIQUE INDEX idx_customers_user_id_number ON customers (created_by, id_number);