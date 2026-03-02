// apps/web/src/hooks/warranty/useWarrantyList.ts
import { useState, useEffect, useCallback } from 'react'
import { warrantyService } from '@/services/warranty.service'
import { Warranty, WarrantyFilterParams } from '@/types/warranty'
import { useToast } from '@/hooks/use-toast'
import { debounce } from 'lodash'
import { PaginationMeta } from '@/types/common'
import { formatDateForInput, formatJustDate } from '@/lib/utils'

export const useWarrantyList = () => {
    const [warranties, setWarranties] = useState<Warranty[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()

    // State Filter
    const [filters, setFilters] = useState<WarrantyFilterParams>({
        page: 1,
        limit: 5, // Trùng với limit của module khác
        keyword: '',
        status: 'ALL',
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

    // Cấu hình Stats riêng cho phần Bảo hành
    const [stats, setStats] = useState({ receivedTodayCount: 0, doneTodayCount: 0 })

    const fetchWarranties = async (currentFilters: WarrantyFilterParams) => {
        try {
            setIsLoading(true)
            
            const res = await warrantyService.getAll(currentFilters)
            
            setWarranties(res.data || [])
            setMeta(res.meta)
            
            // Giả định backend trả về stats (Sau này BE cập nhật thì nó sẽ map vào đây)
            if ((res as any).stats) {
                setStats((res as any).stats)
            } else {
                setStats({ receivedTodayCount: 0, doneTodayCount: 0 })
            }

        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: 'Không thể tải danh sách phiếu bảo hành.',
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Debounce search: Chỉ gọi API sau khi ngừng gõ 500ms
    const debouncedFetch = useCallback(
        debounce((nextFilters) => fetchWarranties(nextFilters), 500),
        [],
    )

    // Lắng nghe các thay đổi filter (trừ keyword sẽ gọi qua debounce)
    useEffect(() => {
        fetchWarranties(filters)
    }, [
        filters.page,
        filters.status,
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

    const setStatus = (st: string) =>
        setFilters((prev) => ({ ...prev, status: st as any, page: 1 }))
    const setPage = (p: number) => setFilters((prev) => ({ ...prev, page: p }))

    // Refresh data
    const refresh = () => fetchWarranties(filters)

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
        warranties,
        isLoading,
        meta,
        stats, 
        filters,
        setKeyword,
        setStatus,
        setPage,
        refresh,
        formatJustDate,
        setDateFilter,
    }
}