-- 1. Thêm cột created_by (cho phép NULL tạm thời để tránh lỗi data cũ)
ALTER TABLE phones
ADD COLUMN import_by INT NULL;

-- 2. Gán created_by cho data cũ
-- Giả sử user id = 1 là admin / system
UPDATE phones
SET import_by = 1
WHERE import_by IS NULL;

-- 3. Đổi created_by thành NOT NULL
ALTER TABLE phones
MODIFY COLUMN import_by INT NOT NULL;

-- 4. Tạo foreign key
ALTER TABLE phones
ADD CONSTRAINT fk_phones_import_by_users
FOREIGN KEY (import_by) REFERENCES users(id) 
ON DELETE RESTRICT;
