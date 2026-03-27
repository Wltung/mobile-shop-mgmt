// src/hooks/usePhoneList.ts
import { useState, useEffect, useCallback } from 'react'
import { phoneService } from '@/services/phone.service'
import { Phone, PhoneFilterParams } from '@/types/phone'
import { useToast } from '@/hooks/use-toast'
import { debounce } from 'lodash'
import { PaginationMeta } from '@/types/common'
import { formatCurrency, formatDateForInput, formatJustDate } from '@/lib/utils'
import { invoiceService } from '@/services/invoice.service'

// Định nghĩa kiểu danh sách
type ListType = 'IMPORT' | 'SALE'

export const usePhoneList = (type: ListType = 'IMPORT') => {
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

    const [stats, setStats] = useState({ 
        todayCount: 0, 
        todayRevenue: 0,
        inventoryCount: 0,
        inventoryValue: 0
    })

    const fetchPhones = async (currentFilters: PhoneFilterParams) => {
        try {
            setIsLoading(true)
            let res

            // [LOGIC MỚI] Gọi API dựa trên type
            if (type === 'SALE') {
                res = await phoneService.getSales(currentFilters)
            } else {
                res = await phoneService.getAll(currentFilters)
            }
            setPhones(res.data || [])
            setMeta(res.meta) // Lưu meta backend trả về

            if (res.stats) {
                setStats({ 
                    todayCount: res.stats.todayCount || 0, 
                    todayRevenue: res.stats.todayRevenue || 0,
                    inventoryCount: res.stats.inventoryCount || 0,
                    inventoryValue: res.stats.inventoryValue || 0,
                })
            } else {
                setStats({ todayCount: 0, todayRevenue: 0, inventoryCount: 0, inventoryValue: 0 })
            }
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
    }, [
        filters.page,
        filters.status,
        filters.start_date,
        filters.end_date,
        type,
    ])

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

    // Hàm set Filter theo Option (all, today, week, month)
    const setDateFilter = (type: string) => {
        const today = new Date()
        let start = ''
        let end = ''

        if (type === 'today') {
            start = formatDateForInput(today)
            end = formatDateForInput(today)
        } else if (type === 'week') {
            // Lấy ngày đầu tuần (Thứ 2)
            const day = today.getDay() // 0 (CN) -> 6 (T7)
            const diff = today.getDate() - day + (day === 0 ? -6 : 1)
            const monday = new Date(today.setDate(diff))
            start = formatDateForInput(monday)
            end = formatDateForInput(new Date()) // Đến hiện tại
        } else if (type === 'month') {
            // Ngày đầu tháng
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
            start = formatDateForInput(firstDay)
            end = formatDateForInput(new Date())
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

    const deletePhone = async (id: number, invoiceId?: number | null) => {
        try {
            setIsLoading(true)
            if (invoiceId) {
                // Máy có hoá đơn -> Xoá hoá đơn (BE sẽ tự xoá máy)
                await invoiceService.delete(invoiceId)
            } else {
                // Máy nhập tay không hoá đơn -> Xoá máy trực tiếp
                await phoneService.delete(id)
            }
            
            toast({ title: 'Thành công', description: 'Đã xoá dữ liệu thành công.' })
            refresh()
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error.response?.data?.error || 'Không thể xoá máy.',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return {
        phones,
        isLoading,
        meta,
        stats,
        filters,
        setKeyword,
        setStatus,
        setPage,
        refresh,
        formatCurrency,
        formatJustDate,
        setDateFilter,
        deletePhone,
    }
}
