// src/hooks/useLockImport.ts
import { Phone } from '@/types/phone'
import { useToast } from '@/hooks/use-toast'
import { useLockInvoiceBase } from './useLockInvoiceBase'

interface UseLockImportProps {
    phone: Phone | null
    onSuccess: () => void
    onRequireUpdate: () => void
}

export const useLockImport = ({ phone, onSuccess, onRequireUpdate }: UseLockImportProps) => {
    const { toast } = useToast()

    // Định nghĩa logic validation riêng cho IMPORT
    const validateImport = (): boolean => {
        if (!phone) return false

        const hasSellerName = phone.seller_name && phone.seller_name.trim() !== '' && phone.seller_name !== 'Khách vãng lai'
        const hasContact = (phone.seller_phone && phone.seller_phone.trim() !== '') || (phone.seller_id && phone.seller_id.trim() !== '')

        if (!hasSellerName || !hasContact) {
            toast({
                variant: 'destructive',
                title: 'Thiếu thông tin',
                description: 'Vui lòng cập nhật Tên người bán và SĐT/CCCD trước khi chốt nhập kho.',
            })
            return false
        }
        return true
    }

    // Sử dụng Base Hook
    const { handleLock, isLocking } = useLockInvoiceBase({
        invoiceId: phone?.invoice_id,
        validate: validateImport,
        onSuccess,
        onRequireUpdate,
        successMessage: 'Đã chốt nhập kho và lưu hoá đơn.'
    })

    return { handleLockImport: handleLock, isLocking }
}