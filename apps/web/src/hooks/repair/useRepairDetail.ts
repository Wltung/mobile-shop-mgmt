import { useState, useEffect, useCallback } from 'react'
import { repairService } from '@/services/repair.service'
import { Repair } from '@/types/repair'
import { useToast } from '@/hooks/use-toast'

export const useRepairDetail = (id: number) => {
    const [repair, setRepair] = useState<Repair | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()

    const fetchRepairDetail = useCallback(async () => {
        if (!id) return
        try {
            setIsLoading(true)
            const data = await repairService.getDetail(id)
            setRepair(data)
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: 'Không thể tải thông tin phiếu sửa chữa.',
            })
        } finally {
            setIsLoading(false)
        }
    }, [id, toast])

    useEffect(() => {
        fetchRepairDetail()
    }, [fetchRepairDetail])

    return {
        repair,
        isLoading,
        refresh: fetchRepairDetail,
    }
}