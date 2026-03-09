import { useState, useEffect, useCallback } from 'react'
import { invoiceService } from '@/services/invoice.service'
import { Invoice, InvoiceFilterParams } from '@/types/invoice'
import { useToast } from '@/hooks/use-toast'
import { debounce } from 'lodash'
import { PaginationMeta } from '@/types/common'
import { formatDateForInput } from '@/lib/utils'

export const useInvoiceList = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()

    // State Filter
    const [filters, setFilters] = useState<InvoiceFilterParams>({
        page: 1,
        limit: 10, // Có thể chỉnh thành 5 nếu bạn muốn giống trang bảo hành
        keyword: '',
        status: 'ALL',
        type: 'ALL',
        start_date: '',
        end_date: '',
    })

    // State phân trang
    const [meta, setMeta] = useState<PaginationMeta>({
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 0,
        total_value: 0,
    })

    // Cấu hình Stats (Doanh thu & Số lượng)
    const [stats, setStats] = useState({ totalRevenue: 0, totalCount: 0 })

    const fetchInvoices = async (currentFilters: InvoiceFilterParams) => {
        try {
            setIsLoading(true)
            
            const res = await invoiceService.getAll(currentFilters)
            
            setInvoices(res.data || [])
            if (res.meta) setMeta(res.meta)
            
            if (res.stats) {
                setStats(res.stats)
            } else {
                setStats({ totalRevenue: 0, totalCount: 0 })
            }

        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: 'Không thể tải danh sách hoá đơn.',
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Debounce search: Chỉ gọi API sau khi ngừng gõ 500ms
    const debouncedFetch = useCallback(
        debounce((nextFilters) => fetchInvoices(nextFilters), 500),
        [],
    )

    // Lắng nghe các thay đổi filter (trừ keyword sẽ gọi qua debounce)
    useEffect(() => {
        fetchInvoices(filters)
    }, [
        filters.page,
        filters.status,
        filters.type,
        filters.start_date,
        filters.end_date,
    ])

    // Hàm update filter cho UI dùng
    const setKeyword = (kw: string) => {
        setFilters((prev) => {
            const next = { ...prev, keyword: kw, page: 1 } 
            debouncedFetch(next) 
            return next
        })
    }

    const setStatus = (st: string) => setFilters((prev) => ({ ...prev, status: st as any, page: 1 }))
    const setType = (tp: string) => setFilters((prev) => ({ ...prev, type: tp as any, page: 1 }))
    const setPage = (p: number) => setFilters((prev) => ({ ...prev, page: p }))

    // Refresh data
    const refresh = () => fetchInvoices(filters)

    // Hàm set Filter theo Option (all, today, week, month)
    const setDateFilter = (type: string) => {
        const today = new Date()
        let start = ''
        let end = ''

        if (type === 'today') {
            start = formatDateForInput(today)
            end = formatDateForInput(today)
        } else if (type === 'week') {
            const day = today.getDay() 
            const diff = today.getDate() - day + (day === 0 ? -6 : 1)
            const monday = new Date(today.setDate(diff))
            start = formatDateForInput(monday)
            end = formatDateForInput(new Date()) 
        } else if (type === 'month') {
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
            start = formatDateForInput(firstDay)
            end = formatDateForInput(new Date())
        } else {
            start = ''
            end = ''
        }

        setFilters((prev) => ({
            ...prev,
            start_date: start,
            end_date: end,
            page: 1, 
        }))
    }

    return {
        invoices,
        isLoading,
        meta,
        stats, 
        filters,
        setKeyword,
        setStatus,
        setType,
        setPage,
        setDateFilter,
        refresh,
    }
}