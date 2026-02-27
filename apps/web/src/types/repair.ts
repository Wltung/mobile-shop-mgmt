// apps/web/src/types/repair.ts

import { PaginationMeta } from "./common"

export type RepairType = 'NORMAL' | 'WARRANTY'
export type RepairStatus = 'PENDING' | 'REPAIRING' | 'WAITING_CUSTOMER' | 'COMPLETED' | 'DELIVERED'

export interface Repair {
    id: number
    phone_id?: number | null
    customer_id?: number | null
    repair_type: RepairType
    description?: string
    part_cost?: number
    repair_price?: number
    device_password?: string
    status: RepairStatus // Trạng thái phiếu sửa
    created_at: string
    updated_at?: string

    // --- Các trường JOIN từ BE trả về ---
    customer_name?: string
    customer_phone?: string
    device_name?: string // Tên máy (Đời máy)
}

export interface RepairFilterParams {
    page?: number
    limit?: number
    keyword?: string
    status?: string
    start_date?: string
    end_date?: string
}

export interface RepairListResponse {
    message: string
    data: Repair[]
    meta: PaginationMeta
    // Thêm stats tuỳ chỉnh cho Sửa chữa nếu Backend trả về
    stats?: {
        repairingCount: number
        completedTodayCount: number
    }
}

export interface CreateRepairResponse {
    message: string
    repair_id: number
}