// apps/web/src/hooks/repair/useRepairList.ts
import { useState, useEffect, useCallback } from 'react'
import { repairService } from '@/services/repair.service'
import { Repair, RepairFilterParams } from '@/types/repair'
import { useToast } from '@/hooks/use-toast'
import { debounce } from 'lodash'
import { PaginationMeta } from '@/types/common'
import { formatCurrency, formatDateForInput, formatJustDate } from '@/lib/utils'

export const useRepairList = () => {
    const [repairs, setRepairs] = useState<Repair[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()

    // State Filter
    const [filters, setFilters] = useState<RepairFilterParams>({
        page: 1,
        limit: 5, // Trùng với limit của bạn trong phone
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

    // Cấu hình Stats riêng cho phần Sửa chữa
    const [stats, setStats] = useState({ repairingCount: 0, completedTodayCount: 0 })

    const fetchRepairs = async (currentFilters: RepairFilterParams) => {
        try {
            setIsLoading(true)
            
            const res = await repairService.getAll(currentFilters)
            
            setRepairs(res.data || [])
            setMeta(res.meta)
            
            // Giả định backend trả về stats. Nếu chưa có, mock tạm để UI không lỗi
            if (res.stats) {
                setStats(res.stats)
            } else {
                setStats({ repairingCount: 0, completedTodayCount: 0 })
            }

        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: 'Không thể tải danh sách phiếu sửa chữa.',
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Debounce search: Chỉ gọi API sau khi ngừng gõ 500ms
    const debouncedFetch = useCallback(
        debounce((nextFilters) => fetchRepairs(nextFilters), 500),
        [],
    )

    // Riêng keyword sẽ được xử lý debounce ở UI event
    useEffect(() => {
        fetchRepairs(filters)
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
        setFilters((prev) => ({ ...prev, status: st, page: 1 }))
    const setPage = (p: number) => setFilters((prev) => ({ ...prev, page: p }))

    // Refresh data
    const refresh = () => fetchRepairs(filters)

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

    const deleteRepair = async (id: number) => {
        try {
            setIsLoading(true)
            await repairService.delete(id)
            toast({ title: 'Thành công', description: 'Đã xoá phiếu sửa chữa.' })
            refresh()
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error.response?.data?.error || 'Không thể xoá dữ liệu.',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return {
        repairs,
        isLoading,
        meta,
        stats, // Trả ra stats của sửa chữa
        filters,
        setKeyword,
        setStatus,
        setPage,
        refresh,
        formatCurrency,
        formatJustDate,
        setDateFilter,
        deleteRepair
    }
}