ALTER TABLE invoices 
ADD COLUMN discount BIGINT DEFAULT 0 AFTER total_amount;