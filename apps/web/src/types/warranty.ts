// apps/web/src/types/warranty.ts

export type WarrantyStatus = 'RECEIVED' | 'PROCESSING' | 'DONE' | 'CANCELLED'

export interface Warranty {
    id: number
    warranty_code?: string
    type: 'SALE' | 'REPAIR'
    customer_id?: number
    phone_id?: number
    invoice_id?: number
    device_name: string
    imei?: string
    description: string
    technical_note?: string
    status: WarrantyStatus
    cost: number
    start_date?: string
    end_date?: string
    created_at: string
    updated_at: string
    
    // Thuộc tính nối từ DB
    customer_name?: string
    customer_phone?: string
    invoice_code?: string
}

export interface WarrantyFilterParams {
    page?: number
    limit?: number
    keyword?: string
    status?: WarrantyStatus | 'ALL'
    start_date?: string
    end_date?: string
}

export interface WarrantyListResponse {
    data: Warranty[]
    meta: {
        page: number
        limit: number
        total: number
        total_pages: number
        total_value: number
    }
}