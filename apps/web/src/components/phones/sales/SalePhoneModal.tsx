'use client'

import { X } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog'
import SalePhoneForm from './SalePhoneForm'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function SalePhoneModal({ isOpen, onClose, onSuccess }: Props) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] gap-0 overflow-hidden rounded-xl border-none bg-white p-0 shadow-2xl sm:max-w-2xl">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-200 px-6 py-4">
                    <DialogTitle className="text-xl font-bold text-slate-900">
                        Lập hoá đơn bán máy
                    </DialogTitle>
                    <DialogClose asChild>
                        <button className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none">
                            <X className="h-6 w-6" />
                        </button>
                    </DialogClose>
                </DialogHeader>

                {/* Form Body */}
                <div className="flex-1 overflow-hidden">
                    <SalePhoneForm
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
