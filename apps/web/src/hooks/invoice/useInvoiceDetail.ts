import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { invoiceService } from '@/services/invoice.service'
import { Invoice } from '@/types/invoice'

export const useInvoiceDetail = (id: number) => {
    const [invoice, setInvoice] = useState<Invoice | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const { toast } = useToast()

    // Tách hàm fetch ra và dùng useCallback để tái sử dụng
    const fetchInvoice = useCallback(async () => {
        if (!id || isNaN(id)) return

        try {
            setIsLoading(true)
            const data = await invoiceService.getDetail(id)
            setInvoice(data)
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: 'Không tìm thấy hoặc không thể tải hoá đơn.',
            })
            // router.push('/dashboard/sales') // Tuỳ chọn: Có thể bỏ redirect tự động để UX mượt hơn
        } finally {
            setIsLoading(false)
        }
    }, [id, toast])

    useEffect(() => {
        fetchInvoice()
    }, [fetchInvoice])

    return { 
        invoice, 
        isLoading, 
        refresh: fetchInvoice // <--- Export hàm này ra
    }
}