// apps/web/src/types/invoice.ts

export type InvoiceType = 'IMPORT' | 'SALE' | 'REPAIR'
export type InvoiceStatus = 'DRAFT' | 'PAID' | 'CANCELLED'
export type ItemType = 'PHONE' | 'PART' | 'SERVICE'

// Dữ liệu chi tiết 1 dòng trong hóa đơn
export interface InvoiceItem {
    id: number
    item_type: ItemType
    phone_id?: number | null // Có thể null nếu bán phụ kiện
    description?: string
    quantity: number
    unit_price: number
    amount: number
    warranty_months?: number
    warranty_expiry?: string
    imei?: string
    phone_details?: {
        color?: string
        storage?: string
        appearance?: string
        battery?: string
        [key: string]: any
    }
}

export interface CreateInvoiceItem {
    item_type: ItemType
    phone_id?: number | null
    description?: string
    quantity: number
    unit_price: number
    warranty_months?: number
}

// Payload gửi lên API để tạo hóa đơn
export interface CreateInvoiceRequest {
    type: InvoiceType
    status?: InvoiceStatus
    customer_id?: number | null
    customer_name?: string 
    customer_phone?: string
    note?: string
    items: CreateInvoiceItem[]
}

// Response khi tạo thành công
export interface CreateInvoiceResponse {
    message: string
    invoice_id: number
}

export interface Invoice {
    id: number
    invoice_code: string // HDN-..., HDB-...
    type: InvoiceType
    status: InvoiceStatus
    customer_id: number | null
    total_amount: number
    created_by: number
    created_at: string
    note?: string

    // Danh sách items đi kèm
    items?: InvoiceItem[]

    // Thông tin mở rộng (nếu Backend có JOIN)
    customer_name?: string
    customer_phone?: string
    creator_name?: string
}
