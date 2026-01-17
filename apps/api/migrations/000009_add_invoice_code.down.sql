-- 1. Drop index liên quan
DROP INDEX idx_invoices_code_type ON invoices;
DROP INDEX uniq_invoices_code ON invoices;

-- 2. Drop column code
ALTER TABLE invoices
DROP COLUMN code;
