// src/hooks/usePrintInvoice.ts
import { useState } from 'react'
import { invoiceService } from '@/services/invoice.service'
import { useToast } from '@/hooks/use-toast'
import { Phone } from '@/types/phone'

interface UsePrintInvoiceProps {
    phone: Phone | null
    refreshPhone: () => Promise<void> // Hàm refresh data máy sau khi tạo hóa đơn
}

export const usePrintInvoice = ({ phone, refreshPhone }: UsePrintInvoiceProps) => {
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
    const [activeInvoiceId, setActiveInvoiceId] = useState<number>(0)
    const [isCreatingInvoice, setIsCreatingInvoice] = useState(false)
    const { toast } = useToast()

    const handlePrintInvoice = async () => {
        if (!phone) return

        // Case 1: Đã có hoá đơn -> Mở modal xem ngay
        if (phone.invoice_id) {
            setActiveInvoiceId(phone.invoice_id)
            setIsInvoiceModalOpen(true)
            return
        }

        // Case 2: Chưa có -> Tạo mới
        try {
            setIsCreatingInvoice(true)
            
            // Payload tạo hoá đơn nhập
            const res = await invoiceService.create({
                type: 'IMPORT',
                status: 'PAID',
                customer_id: phone.source_id, // ID người bán
                note: `Hoá đơn nhập máy ${phone.model_name} (IMEI: ${phone.imei})`,
                items: [{
                    item_type: 'PHONE',
                    phone_id: phone.id,
                    description: phone.model_name,
                    quantity: 1,
                    unit_price: phone.purchase_price,
                    warranty_months: 0
                }]
            })

            toast({ title: 'Thành công', description: 'Đã tạo hoá đơn nhập máy mới.' })
            
            // Refresh lại data Phone để lấy invoice_id mới và invoice_code cập nhật lên UI
            await refreshPhone()
            
            // Mở modal với ID vừa tạo
            setActiveInvoiceId(res.invoice_id)
            setIsInvoiceModalOpen(true)

        } catch (error) {
            toast({ 
                variant: 'destructive', 
                title: 'Lỗi', 
                description: 'Không thể tạo hoá đơn. Vui lòng thử lại.' 
            })
        } finally {
            setIsCreatingInvoice(false)
        }
    }

    return {
        isInvoiceModalOpen,
        setIsInvoiceModalOpen,
        activeInvoiceId,
        isCreatingInvoice,
        handlePrintInvoice
    }
}