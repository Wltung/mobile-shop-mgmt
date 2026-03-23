SET FOREIGN_KEY_CHECKS = 0;

-- 1. Tạo lại bảng customers (giả định cấu trúc cơ bản)
CREATE TABLE customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    phone VARCHAR(50),
    id_number VARCHAR(50),
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- 2. Bảng INVOICES: xóa cột text, thêm lại customer_id
ALTER TABLE invoices 
DROP COLUMN customer_name,
DROP COLUMN customer_phone,
DROP COLUMN customer_id_number;

ALTER TABLE invoices 
ADD COLUMN customer_id BIGINT,
ADD CONSTRAINT fk_invoices_customer 
FOREIGN KEY (customer_id) REFERENCES customers(id);

-- 3. Bảng REPAIRS
ALTER TABLE repairs 
DROP COLUMN customer_name,
DROP COLUMN customer_phone;

ALTER TABLE repairs 
ADD COLUMN customer_id BIGINT,
ADD CONSTRAINT fk_repairs_customer 
FOREIGN KEY (customer_id) REFERENCES customers(id);

-- 4. Bảng WARRANTIES
ALTER TABLE warranties 
DROP COLUMN customer_name,
DROP COLUMN customer_phone;

ALTER TABLE warranties 
ADD COLUMN customer_id BIGINT,
ADD CONSTRAINT fk_warranties_customer 
FOREIGN KEY (customer_id) REFERENCES customers(id);

-- 5. Bảng PHONES
ALTER TABLE phones 
DROP COLUMN seller_name,
DROP COLUMN seller_phone,
DROP COLUMN seller_id_number;

ALTER TABLE phones 
ADD COLUMN source_id BIGINT;

-- (Nếu trước đó source_id là FK thì thêm lại, ví dụ:)
-- ALTER TABLE phones 
-- ADD CONSTRAINT fk_phones_source 
-- FOREIGN KEY (source_id) REFERENCES customers(id);

SET FOREIGN_KEY_CHECKS = 1;