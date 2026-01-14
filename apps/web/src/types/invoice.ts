// apps/web/src/types/invoice.ts

export type InvoiceType = 'IMPORT' | 'SALE' | 'REPAIR';
export type InvoiceStatus = 'DRAFT' | 'PAID' | 'CANCELLED';
export type ItemType = 'PHONE' | 'PART' | 'SERVICE';

// Dữ liệu chi tiết 1 dòng trong hóa đơn
export interface InvoiceItem {
    item_type: ItemType;
    phone_id?: number | null; // Có thể null nếu bán phụ kiện
    description?: string;
    quantity: number;
    unit_price: number;
    warranty_months?: number;
}

// Payload gửi lên API để tạo hóa đơn
export interface CreateInvoiceRequest {
    type: InvoiceType;
    status?: InvoiceStatus;
    customer_id?: number | null;
    note?: string;
    items: InvoiceItem[];
}

// Response khi tạo thành công
export interface CreateInvoiceResponse {
    message: string;
    invoice_id: number;
}