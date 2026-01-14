-- Rollback invoice_items
DROP TABLE IF EXISTS invoice_items;

-- Rollback invoices về trạng thái cũ
ALTER TABLE invoices
    DROP COLUMN status,
    ADD COLUMN phone_id INT NULL,
    ADD COLUMN warranty_months INT DEFAULT 0,
    ADD COLUMN warranty_expiry DATE,
    ADD CONSTRAINT fk_invoices_phone
        FOREIGN KEY (phone_id) REFERENCES phones(id)
        ON DELETE SET NULL;
