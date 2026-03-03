import { useState, useEffect, useCallback, useMemo } from 'react'
import { warrantyService } from '@/services/warranty.service'
import { Warranty } from '@/types/warranty'
import { useToast } from '@/hooks/use-toast'

export const useWarrantyDetail = (id: number) => {
    const [warranty, setWarranty] = useState<Warranty | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()

    const fetchWarrantyDetail = useCallback(async () => {
        if (!id) return
        try {
            setIsLoading(true)
            const data = await warrantyService.getDetail(id)
            setWarranty(data)
        } catch (error) {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể tải thông tin phiếu bảo hành.' })
        } finally {
            setIsLoading(false)
        }
    }, [id, toast])

    useEffect(() => {
        fetchWarrantyDetail()
    }, [fetchWarrantyDetail])

    // --- MANG LOGIC TÍNH TOÁN VÀO HOOK VÀ DÙNG USEMEMO ---
    const { daysRemaining, isExpired } = useMemo(() => {
        if (!warranty?.end_date) return { daysRemaining: null, isExpired: false }
        const end = new Date(warranty.end_date)
        const now = new Date()
        const diffTime = end.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return {
            daysRemaining: diffDays,
            isExpired: diffDays < 0
        }
    }, [warranty])

    return {
        warranty,
        isLoading,
        refresh: fetchWarrantyDetail,
        daysRemaining,
        isExpired
    }
}