-- 1. Xoá foreign key
ALTER TABLE phones
DROP FOREIGN KEY fk_phones_created_by;

-- 2. Xoá cột created_by
ALTER TABLE phones
DROP COLUMN created_by;
