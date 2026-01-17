// src/components/phones/import/ImportPhoneModal.tsx
'use client'

import { X } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog'
import ImportPhoneForm from './ImportPhoneForm'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function ImportPhoneModal({
    isOpen,
    onClose,
    onSuccess,
}: Props) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] gap-0 overflow-hidden rounded-2xl bg-white p-0 sm:max-w-4xl border-none shadow-2xl">
                {/* Header dính cứng ở trên */}
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-100 bg-white px-6 py-5 sticky top-0 z-20">
                    <div>
                        <DialogTitle className="text-xl font-bold leading-6 text-slate-900">
                            Tạo phiếu nhập máy mới
                        </DialogTitle>
                        <p className="mt-1 text-sm text-slate-500">
                            Nhập thông tin chi tiết để thêm thiết bị vào kho.
                        </p>
                    </div>
                    <DialogClose asChild>
                        <button className="rounded-full bg-slate-50 p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none">
                            <X className="h-6 w-6" />
                        </button>
                    </DialogClose>
                </DialogHeader>

                {/* Form Body */}
                <ImportPhoneForm
                    onSuccess={() => {
                        onSuccess()
                        onClose()
                    }}
                    onCancel={onClose}
                />
            </DialogContent>
        </Dialog>
    )
}