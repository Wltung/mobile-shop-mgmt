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
            <DialogContent className="max-h-[90vh] gap-0 overflow-hidden rounded-2xl bg-white p-0 sm:max-w-4xl">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-200 px-6 py-5">
                    <DialogTitle className="text-xl font-bold leading-6 text-slate-900">
                        Tạo phiếu nhập máy mới
                    </DialogTitle>
                    {/* Nút X custom cho giống thiết kế */}
                    <DialogClose asChild>
                        <button className="rounded-full bg-white p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-500 focus:outline-none">
                            <X className="h-6 w-6" />
                        </button>
                    </DialogClose>
                </DialogHeader>

                {/* Gọi Form ở đây */}
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
