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

// Helper: Chuyển đổi Date/String sang ISO Local Time
// Giúp tránh lỗi lệch ngày/giờ do toISOString() mặc định dùng UTC
const toLocalISOString = (dateVal: string | Date) => {
    const date = new Date(dateVal)
    // Trừ đi offset (phút) để đưa về giờ địa phương trước khi toISO
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
    return date.toISOString()
}

/**
 * Format cho input type="date"
 * Output: YYYY-MM-DD
 */
export const formatDateForInput = (dateVal: string | Date | undefined) => {
    if (!dateVal) return ''
    return toLocalISOString(dateVal).split('T')[0]
}

/**
 * Format cho input type="datetime-local"
 * Output: YYYY-MM-DDTHH:mm
 */
export const formatDateTimeForInput = (dateVal: string | Date | undefined) => {
    if (!dateVal) return ''
    // Lấy 16 ký tự đầu: YYYY-MM-DDTHH:mm
    return toLocalISOString(dateVal).slice(0, 16)
}