// src/hooks/useLockInvoiceBase.ts
import { useState } from 'react'
import { invoiceService } from '@/services/invoice.service'
import { useToast } from '@/hooks/use-toast'

interface UseLockInvoiceBaseProps {
    invoiceId: number | undefined
    validate: () => boolean // Hàm validation do hook con truyền vào (True = OK, False = Lỗi)
    onSuccess: () => void
    onRequireUpdate: () => void
    successMessage?: string
}

export const useLockInvoiceBase = ({
    invoiceId,
    validate,
    onSuccess,
    onRequireUpdate,
    successMessage = 'Đã chốt hoá đơn thành công.'
}: UseLockInvoiceBaseProps) => {
    const [isLocking, setIsLocking] = useState(false)
    const { toast } = useToast()

    const handleLock = async () => {
        if (!invoiceId) return

        // 1. Chạy logic validation riêng của từng loại
        // Nếu validation thất bại (return false), hook con đã tự toast lỗi -> Base hook chỉ mở modal sửa
        if (!validate()) {
            onRequireUpdate()
            return
        }

        // 2. Gọi API chung
        try {
            setIsLocking(true)
            await invoiceService.updateStatus(invoiceId, 'PAID')
            
            toast({
                title: 'Thành công',
                description: successMessage,
            })
            
            onSuccess() // Refresh data
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: 'Không thể chốt hoá đơn. Vui lòng thử lại.',
            })
        } finally {
            setIsLocking(false)
        }
    }

    return {
        handleLock,
        isLocking
    }
}