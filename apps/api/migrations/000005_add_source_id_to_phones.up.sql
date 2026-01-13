-- Thêm cột source_id để liên kết với bảng customers
ALTER TABLE phones 
ADD COLUMN source_id INT NULL;

-- Tạo khóa ngoại
ALTER TABLE phones
ADD CONSTRAINT fk_phones_source_customer
FOREIGN KEY (source_id) REFERENCES customers(id)
ON DELETE RESTRICT;