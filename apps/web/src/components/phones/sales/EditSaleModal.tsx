'use client'

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Invoice } from '@/types/invoice'
import EditSaleForm from './EditSaleForm'
import { X } from 'lucide-react'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    invoice: Invoice | null
}

export default function EditSaleModal({ isOpen, onClose, onSuccess, invoice }: Props) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl p-0 gap-0 bg-slate-100 overflow-hidden max-h-[95vh] flex flex-col w-1/2">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 px-6 py-4 bg-white border-b border-slate-200 shrink-0">
                    <div>
                        <DialogTitle className="text-xl font-bold text-slate-800">
                            Chỉnh sửa thông tin đơn bán
                        </DialogTitle>
                        <p className="text-sm text-slate-500 font-normal">
                            Cập nhật chi tiết giao dịch khách hàng và thanh toán.
                        </p>
                    </div>
                    <DialogClose asChild>
                        <button className="rounded-full bg-slate-50 p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none">
                            <X className="h-6 w-6" />
                        </button>
                    </DialogClose>
                </DialogHeader>
                
                <div className="flex-1 overflow-hidden">
                    {invoice && (
                        <EditSaleForm 
                            invoice={invoice} 
                            onSuccess={onSuccess} 
                            onCancel={onClose} 
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}