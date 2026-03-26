// apps/web/src/types/warranty.ts

export type WarrantyStatus = 'RECEIVED' | 'PROCESSING' | 'DONE' | 'CANCELLED'

export interface WarrantyDescription {
    condition?: string
    fault?: string
    part_name?: string
}

export interface WarrantyTechnicalNote {
    special_note?: string
    warranty_condition?: string
}

export interface Warranty {
    id: number
    warranty_code?: string
    type: 'SALE' | 'REPAIR'
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
    customer_id_number?: string // Bổ sung CCCD
    warranty_months?: number
    invoice_code?: string

    // Dữ liệu JSON parse từ Backend
    description_json?: WarrantyDescription
    technical_note_json?: WarrantyTechnicalNote
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
    stats?: {
        receivedTodayCount: number
        doneTodayCount: number
    }
}