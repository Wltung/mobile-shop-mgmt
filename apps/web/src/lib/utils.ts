import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const formatCurrency = (val: number | string | undefined) => {
    if (!val) return '0 ₫'
    const num = Number(val)
    if (isNaN(num)) return '0 ₫'
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(num)
}

export const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

// Hàm Helper: Format Date sang YYYY-MM-DD
export const formatDateISO = (date: Date) => {
    return date.toISOString().split('T')[0]
}
