import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { invoiceService } from '@/services/invoice.service'
import { Invoice } from '@/types/invoice'

export const useInvoiceDetail = (id: number) => {
    const [invoice, setInvoice] = useState<Invoice | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        if (!id || isNaN(id)) return

        const fetchInvoice = async () => {
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
                router.push('/dashboard/sales') // Quay về trang danh sách nếu lỗi
            } finally {
                setIsLoading(false)
            }
        }

        fetchInvoice()
    }, [id, router, toast])

    return {
        invoice,
        isLoading,
        // Có thể return thêm các hàm action khác nếu cần (ví dụ: cancelInvoice...)
    }
}
