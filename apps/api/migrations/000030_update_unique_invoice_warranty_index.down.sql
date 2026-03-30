-- ===== INVOICES =====

-- . Xoá index kép
ALTER TABLE invoices DROP INDEX idx_invoice_code_user;

-- ===== WARRANTIES =====

-- . Xoá index kép
ALTER TABLE warranties DROP INDEX idx_warranty_code_user;