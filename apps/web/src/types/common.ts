// src/types/common.ts
import { ReactNode } from 'react'

export interface ColumnDef<T> {
    header: string
    accessorKey?: keyof T // Tên trường data (ví dụ: 'imei')
    cell?: (item: T) => ReactNode // Hàm render tùy chỉnh (ví dụ: in đậm, badge status)
    className?: string // Class cho td/th (ví dụ: 'text-center')
}

export interface StatItem {
    label: string
    value: string | number
    icon: ReactNode
    color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'emerald' // Định nghĩa các theme màu
}

export interface PaginationMeta {
    page: number
    limit: number
    total: number
    total_pages: number
    total_value: number
}
