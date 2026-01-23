-- Chuyển đổi bảng phones
ALTER TABLE phones 
MODIFY COLUMN purchase_price BIGINT NOT NULL DEFAULT 0,
MODIFY COLUMN sale_price BIGINT;

-- Chuyển đổi bảng invoices
ALTER TABLE invoices 
MODIFY COLUMN total_amount BIGINT NOT NULL DEFAULT 0;

-- Chuyển đổi bảng invoice_items
ALTER TABLE invoice_items 
MODIFY COLUMN unit_price BIGINT NOT NULL DEFAULT 0,
MODIFY COLUMN amount BIGINT NOT NULL DEFAULT 0;