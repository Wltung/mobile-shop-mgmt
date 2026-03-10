// apps/web/src/types/invoice.ts

import { PaginationMeta } from "./common"

export type InvoiceType = 'IMPORT' | 'SALE' | 'REPAIR'
export type InvoiceStatus = 'DRAFT' | 'PAID' | 'CANCELLED'
export type ItemType = 'PHONE' | 'PART' | 'SERVICE' | 'TIỀN CÔNG'

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
    payment_method?: string
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
    payment_method?: string
    customer_id: number | null
    total_amount: number
    discount?: number
    created_by: number
    created_at: string
    note?: string

    // Danh sách items đi kèm
    items?: InvoiceItem[]

    // Thông tin mở rộng (nếu Backend có JOIN)
    customer_name?: string
    customer_phone?: string
    customer_id_number?: string
    creator_name?: string
    repair_id?: number
}

export interface InvoiceFilterParams {
    page?: number
    limit?: number
    keyword?: string
    type?: InvoiceType | 'ALL'
    status?: InvoiceStatus | 'ALL'
    start_date?: string
    end_date?: string
}

export interface InvoiceListResponse {
    data: Invoice[]
    meta: PaginationMeta
    stats?: {
        totalRevenue: number
        totalCount: number
    }
}