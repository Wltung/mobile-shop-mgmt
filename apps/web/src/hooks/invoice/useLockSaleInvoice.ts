// src/hooks/useLockSale.ts
import { Invoice } from '@/types/invoice'
import { useToast } from '@/hooks/use-toast'
import { useLockInvoiceBase } from './useLockInvoiceBase'

interface UseLockSaleProps {
    invoice: Invoice | null
    onSuccess: () => void
    onRequireUpdate: () => void
}

export const useLockSale = ({ invoice, onSuccess, onRequireUpdate }: UseLockSaleProps) => {
    const { toast } = useToast()

    // Định nghĩa logic validation riêng cho SALE
    const validateSale = (): boolean => {
        if (!invoice) return false

        const hasCustomer = invoice.customer_name && invoice.customer_name.trim() !== ''
        const hasItems = invoice.items && invoice.items.length > 0

        if (!hasCustomer || !hasItems) {
            toast({
                variant: 'destructive',
                title: 'Thiếu thông tin',
                description: 'Vui lòng cập nhật Tên khách hàng và Máy bán trước khi chốt đơn.',
            })
            return false // Validation failed
        }
        return true // Validation passed
    }

    // Sử dụng Base Hook
    const { handleLock, isLocking } = useLockInvoiceBase({
        invoiceId: invoice?.id,
        validate: validateSale,
        onSuccess,
        onRequireUpdate,
        successMessage: 'Đã chốt đơn và kích hoạt bảo hành.'
    })

    return { handleLockSale: handleLock, isLocking }
}