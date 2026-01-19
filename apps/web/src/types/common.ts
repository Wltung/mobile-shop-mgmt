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
    color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' // Định nghĩa các theme màu
}
