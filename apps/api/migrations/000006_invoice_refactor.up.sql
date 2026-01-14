-- 1. Sửa bảng invoices: bỏ các field không nên để ở header
ALTER TABLE invoices
    DROP FOREIGN KEY fk_invoices_phone,
    DROP COLUMN phone_id,
    DROP COLUMN warranty_months,
    DROP COLUMN warranty_expiry,
    ADD COLUMN status ENUM('DRAFT', 'PAID', 'CANCELLED') DEFAULT 'PAID' AFTER type;

-- 2. Tạo bảng invoice_items
CREATE TABLE invoice_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,

    item_type ENUM('PHONE', 'PART', 'SERVICE') NOT NULL,
    phone_id INT NULL,

    description VARCHAR(255),
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,

    warranty_months INT DEFAULT 0,
    warranty_expiry DATE,

    CONSTRAINT fk_invoice_items_invoice
        FOREIGN KEY (invoice_id) REFERENCES invoices(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_invoice_items_phone
        FOREIGN KEY (phone_id) REFERENCES phones(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- 3. (Optional nhưng nên có) index cho performance
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoices_type ON invoices(type);
