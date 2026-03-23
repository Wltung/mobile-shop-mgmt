-- 3. Bảng WARRANTIES
ALTER TABLE warranties DROP COLUMN customer_id;
ALTER TABLE warranties 
ADD COLUMN customer_name VARCHAR(255) NULL,
ADD COLUMN customer_phone VARCHAR(50) NULL;

-- 4. Bảng PHONES
ALTER TABLE phones DROP COLUMN source_id;
ALTER TABLE phones 
ADD COLUMN seller_name VARCHAR(255) NULL,
ADD COLUMN seller_phone VARCHAR(50) NULL,
ADD COLUMN seller_id_number VARCHAR(50) NULL;

-- 5. Xóa bảng customers
DROP TABLE IF EXISTS customers;