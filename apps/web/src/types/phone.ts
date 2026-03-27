// src/types/phone.ts

import { PaginationMeta } from './common'

export type PhoneStatus = 'IN_STOCK' | 'SOLD' | 'REPAIRING'

export interface Phone {
    id: number
    imei: string
    model_name: string
    status: PhoneStatus
    purchase_price: number
    purchase_date: string
    sale_price?: number
    sale_date: string
    note?: string
    created_at: string // API trả về string ISO
    details?: Record<string, any> // JSON dynamic
    importer_name?: string
    seller_name?: string
    seller_phone?: string
    seller_id?: string // CCCD
    buyer_name?: string
    invoice_status?: 'PAID' | 'DRAFT' | 'CANCELLED' | null
    invoice_code?: string
    invoice_id?: number
    source_id?: number
    payment_method?: string
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
    stats?: {
        todayCount?: number
        todayRevenue?: number
        inventoryCount?: number
        inventoryValue?: number
    }
}

export interface PhoneFilterParams {
    page?: number
    limit?: number
    keyword?: string
    status?: string
    start_date?: string
    end_date?: string
    has_sale_price?: boolean
    invoice_status?: string
}
