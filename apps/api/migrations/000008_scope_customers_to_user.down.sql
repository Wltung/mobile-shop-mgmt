-- 1. Xoá UNIQUE index theo scope user
DROP INDEX uniq_customers_user_phone ON customers;
DROP INDEX uniq_customers_user_id_number ON customers;

-- 2. Tạo lại UNIQUE global như ban đầu
CREATE UNIQUE INDEX phone ON customers (phone);
CREATE UNIQUE INDEX id_number ON customers (id_number);

-- 3. Xoá foreign key
ALTER TABLE customers
DROP FOREIGN KEY fk_customers_created_by;

-- 4. Xoá cột created_by
ALTER TABLE customers
DROP COLUMN created_by;
