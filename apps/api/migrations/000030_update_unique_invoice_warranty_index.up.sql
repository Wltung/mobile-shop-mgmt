-- ===== INVOICES =====

-- Tạo UNIQUE index kép (invoice_code + created_by)
CREATE UNIQUE INDEX idx_invoice_code_user 
ON invoices(invoice_code, created_by);


-- ===== WARRANTIES =====

-- Tạo UNIQUE index kép (warranty_code + user_id)
CREATE UNIQUE INDEX idx_warranty_code_user 
ON warranties(warranty_code, user_id);