// src/hooks/useLockInvoice.ts
import { useState } from 'react'
import { invoiceService } from '@/services/invoice.service'
import { useToast } from '@/hooks/use-toast'
import { Phone } from '@/types/phone'

interface UseLockInvoiceProps {
    phone: Phone | null
    onSuccess: () => void        // Callback khi chốt thành công (thường là refresh data)
    onRequireUpdate: () => void  // Callback khi thiếu thông tin (mở modal sửa)
}

export const useLockInvoice = ({ phone, onSuccess, onRequireUpdate }: UseLockInvoiceProps) => {
    const [isLocking, setIsLocking] = useState(false)
    const { toast } = useToast()

    const handleLockInvoice = async () => {
        if (!phone || !phone.invoice_id) return

        // 1. Validate: Phải có tên người bán và (SĐT hoặc CCCD)
        const hasSellerName = phone.seller_name && phone.seller_name.trim() !== '' && phone.seller_name !== 'Khách vãng lai'
        const hasContact = (phone.seller_phone && phone.seller_phone.trim() !== '') || (phone.seller_id && phone.seller_id.trim() !== '')

        if (!hasSellerName || !hasContact) {
            toast({
                variant: 'destructive',
                title: 'Thiếu thông tin',
                description: 'Vui lòng cập nhật Tên người bán và SĐT/CCCD trước khi chốt nhập kho.',
            })
            onRequireUpdate() // Trigger mở modal sửa
            return
        }

        // 2. Call API
        try {
            setIsLocking(true)
            await invoiceService.updateStatus(phone.invoice_id, 'PAID')
            
            toast({
                title: 'Thành công',
                description: 'Đã chốt nhập kho và kích hoạt hoá đơn.',
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
        handleLockInvoice,
        isLocking
    }
}