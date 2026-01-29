// src/hooks/usePhoneDetail.ts
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { phoneService } from '@/services/phone.service'
import { Phone } from '@/types/phone'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/utils'

export const usePhoneDetail = (id: string | number) => {
    const [phone, setPhone] = useState<Phone | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()
    const router = useRouter()

    const fetchDetail = async () => {
        try {
            setIsLoading(true)
            const data = await phoneService.getDetail(Number(id))
            setPhone(data)
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description:
                    'Không thể tải thông tin máy hoặc máy không tồn tại.',
            })
            // Tùy chọn: router.push('/dashboard/import')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (id) fetchDetail()
    }, [id])

    return {
        phone,
        isLoading,
        formatCurrency,
        formatDate,
        refresh: fetchDetail,
        router, // Trả về router để nút Back sử dụng
    }
}
