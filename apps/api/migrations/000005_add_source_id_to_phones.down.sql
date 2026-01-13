-- Xóa khóa ngoại trước
ALTER TABLE phones
DROP FOREIGN KEY fk_phones_source_customer;

-- Xóa cột source_id
ALTER TABLE phones
DROP COLUMN source_id;
