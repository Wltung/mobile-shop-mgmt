// src/hooks/usePhoneList.ts
import { useState, useEffect } from 'react'
import { phoneService } from '@/services/phone.service'
import { PaginationMeta, Phone } from '@/types/phone'
import { useToast } from '@/hooks/use-toast'

export const usePhoneList = () => {
    const [phones, setPhones] = useState<Phone[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()

    // State phân trang
    const [page, setPage] = useState(1)
    const [meta, setMeta] = useState<PaginationMeta>({
        page: 1,
        limit: 5,
        total: 0,
        total_pages: 0,
        total_value: 0,
    })

    const fetchPhones = async (p = 1) => {
        try {
            setIsLoading(true)
            const res = await phoneService.getAll(p, 5)
            const sorted = (res.data || []).sort(
                (a: any, b: any) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime(),
            )
            setPhones(sorted)
            setMeta(res.meta) // Lưu meta backend trả về
            setPage(p)
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

    useEffect(() => {
        fetchPhones(1)
    }, [])

    // Hàm chuyển trang cho UI dùng
    const goToPage = (newPage: number) => {
        if (newPage > 0 && newPage <= meta.total_pages) {
            fetchPhones(newPage)
        }
    }

    // Các hàm tiện ích format (có thể tách ra utils nếu muốn dùng chung nhiều nơi)
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount)

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('vi-VN')

    // Tính toán Stats
    const stats = {
        totalPhones: meta.total,
        totalValue: meta.total_value,
    }

    return {
        phones,
        isLoading,
        stats,
        meta,
        page,
        goToPage,
        formatCurrency,
        formatDate,
        refresh: () => fetchPhones(page),
    }
}
