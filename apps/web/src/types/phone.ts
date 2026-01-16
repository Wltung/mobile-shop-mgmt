// src/types/phone.ts

export type PhoneStatus = 'IN_STOCK' | 'SOLD' | 'REPAIRING'

export interface Phone {
    id: number
    imei: string
    model_name: string
    status: PhoneStatus
    purchase_price: number
    sale_price?: number
    note?: string
    created_at: string // API trả về string ISO
    details?: Record<string, any> // JSON dynamic
    importer_name?: string
    seller_name?: string
    seller_phone?: string
    seller_id_number?: string // CCCD
}

export interface CreatePhoneResponse {
    message: string
    phone_id: number
    source_id: number | null
}

export interface PhoneListResponse {
    message: string
    data: Phone[]
    meta: PaginationMeta
}

export interface PaginationMeta {
    page: number
    limit: number
    total: number
    total_pages: number
    total_value: number
}

export interface PhoneFilterParams {
    page?: number;
    limit?: number;
    keyword?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
}