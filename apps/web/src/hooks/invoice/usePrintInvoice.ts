// src/hooks/usePrintInvoice.ts
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Phone } from '@/types/phone'

interface UsePrintInvoiceProps {
    phone: Phone | null
}

export const usePrintInvoice = ({ phone }: UsePrintInvoiceProps) => {
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
    const [activeInvoiceId, setActiveInvoiceId] = useState<number>(0)
    const { toast } = useToast()

    const handlePrintInvoice = () => {
        if (!phone) return

        // 1. Kiểm tra có ID hoá đơn không
        if (!phone.invoice_id) {
            toast({
                variant: 'destructive',
                title: 'Không thể in',
                description: 'Không tìm thấy thông tin hoá đơn nhập của máy này.',
            })
            return
        }

        // 2. [LOGIC MỚI] Kiểm tra trạng thái phải là PAID
        if (phone.invoice_status !== 'PAID') {
            toast({
                variant: 'destructive',
                title: 'Chưa thể in',
                description: 'Chỉ có thể in phiếu nhập kho khi hoá đơn đã được thanh toán (PAID).',
            })
            return
        }

        // 3. Mở modal nếu hợp lệ
        setActiveInvoiceId(phone.invoice_id)
        setIsInvoiceModalOpen(true)
    }

    return {
        isInvoiceModalOpen,
        setIsInvoiceModalOpen,
        activeInvoiceId,
        handlePrintInvoice,
    }
}