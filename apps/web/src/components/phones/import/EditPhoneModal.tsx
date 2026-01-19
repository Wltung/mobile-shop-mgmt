'use client'

import { X } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog'
import EditPhoneForm from './EditPhoneForm'
import { Phone } from '@/types/phone'

interface Props {
    phone: Phone | null
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function EditPhoneModal({
    phone,
    isOpen,
    onClose,
    onSuccess,
}: Props) {
    if (!phone) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] gap-0 overflow-hidden rounded-xl bg-white p-0 sm:max-w-5xl shadow-2xl border-none">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                    <DialogTitle className="text-xl font-bold text-slate-800">
                        Chỉnh sửa thông tin máy
                    </DialogTitle>
                    <DialogClose asChild>
                        <button className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 hover:bg-slate-100 focus:outline-none">
                            <X className="h-6 w-6" />
                        </button>
                    </DialogClose>
                </DialogHeader>

                {/* Form Body */}
                <div className="flex-1 overflow-hidden">
                    <EditPhoneForm
                        phone={phone}
                        onSuccess={() => {
                            onSuccess()
                            onClose()
                        }}
                        onCancel={onClose}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}