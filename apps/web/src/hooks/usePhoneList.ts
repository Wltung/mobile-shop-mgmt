// src/hooks/usePhoneList.ts
import { useState, useEffect, useCallback } from 'react'
import { phoneService } from '@/services/phone.service'
import { PaginationMeta, Phone, PhoneFilterParams } from '@/types/phone'
import { useToast } from '@/hooks/use-toast'
import { debounce } from 'lodash'

export const usePhoneList = () => {
    const [phones, setPhones] = useState<Phone[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()

    // State Filter
    const [filters, setFilters] = useState<PhoneFilterParams>({
        page: 1,
        limit: 5,
        keyword: '',
        status: '',
        start_date: '',
        end_date: '',
    })

    // State phân trang
    const [meta, setMeta] = useState<PaginationMeta>({
        page: 1,
        limit: 5,
        total: 0,
        total_pages: 0,
        total_value: 0,
    })

    const fetchPhones = async (currentFilters: PhoneFilterParams) => {
        try {
            setIsLoading(true)
            const res = await phoneService.getAll(currentFilters)
            const sorted = (res.data || []).sort(
                (a: any, b: any) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime(),
            )
            setPhones(sorted)
            setMeta(res.meta) // Lưu meta backend trả về
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: 'Không thể tải danh sách điện thoại.',
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Debounce search: Chỉ gọi API sau khi ngừng gõ 500ms
    const debouncedFetch = useCallback(
        debounce((nextFilters) => fetchPhones(nextFilters), 500),
        [],
    )

    // Riêng keyword sẽ được xử lý debounce ở UI event
    useEffect(() => {
        fetchPhones(filters)
    }, [filters.page, filters.status, filters.start_date])

    // Hàm update filter cho UI dùng
    const setKeyword = (kw: string) => {
        // Update state để UI hiển thị
        setFilters((prev) => {
            const next = { ...prev, keyword: kw, page: 1 } // Reset về trang 1 khi search
            debouncedFetch(next) // Gọi API qua debounce
            return next
        })
    }

    const setStatus = (st: string) =>
        setFilters((prev) => ({ ...prev, status: st, page: 1 }))
    const setPage = (p: number) => setFilters((prev) => ({ ...prev, page: p }))

    // Refresh data
    const refresh = () => fetchPhones(filters)

    // Hàm Helper: Format Date sang YYYY-MM-DD
    const formatDateISO = (date: Date) => {
        return date.toISOString().split('T')[0]
    }

    // Hàm set Filter theo Option (all, today, week, month)
    const setDateFilter = (type: string) => {
        const today = new Date()
        let start = ''
        let end = ''

        if (type === 'today') {
            start = formatDateISO(today)
            end = formatDateISO(today)
        } else if (type === 'week') {
            // Lấy ngày đầu tuần (Thứ 2)
            const day = today.getDay() // 0 (CN) -> 6 (T7)
            const diff = today.getDate() - day + (day === 0 ? -6 : 1)
            const monday = new Date(today.setDate(diff))
            start = formatDateISO(monday)
            end = formatDateISO(new Date()) // Đến hiện tại
        } else if (type === 'month') {
            // Ngày đầu tháng
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
            start = formatDateISO(firstDay)
            end = formatDateISO(new Date())
        } else {
            // type === "all" -> Reset rỗng
            start = ''
            end = ''
        }

        setFilters((prev) => ({
            ...prev,
            start_date: start,
            end_date: end,
            page: 1, // Reset về trang 1 khi lọc
        }))
    }

    return {
        phones,
        isLoading,
        meta,
        stats: { totalPhones: meta.total, totalValue: meta.total_value },
        filters,
        setKeyword,
        setStatus,
        setPage,
        refresh,
        formatCurrency: (val: number) =>
            new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
            }).format(val),
        formatDate: (val: string) => new Date(val).toLocaleDateString('vi-VN'),
        setDateFilter,
    }
}
