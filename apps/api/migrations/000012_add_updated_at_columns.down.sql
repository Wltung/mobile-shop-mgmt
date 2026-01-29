-- Xoá cột updated_at khỏi bảng invoices
ALTER TABLE invoices DROP COLUMN updated_at;

-- Xoá cột updated_at khỏi bảng invoice_items
ALTER TABLE invoice_items DROP COLUMN updated_at;

-- Xoá cột updated_at khỏi bảng repairs
ALTER TABLE repairs DROP COLUMN updated_at;

-- Xoá cột updated_at khỏi bảng users
ALTER TABLE users DROP COLUMN updated_at;