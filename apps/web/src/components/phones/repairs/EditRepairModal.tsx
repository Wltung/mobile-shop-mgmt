'use client'

import { X } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog'
import { Repair } from '@/types/repair'
import EditRepairForm from './EditRepairForm'

interface Props {
    isOpen: boolean
    repair: Repair | null
    onClose: () => void
    onSuccess: () => void
}

export default function EditRepairModal({
    isOpen,
    repair,
    onClose,
    onSuccess,
}: Props) {
    if (!repair) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[95vh] gap-0 overflow-hidden rounded-2xl border-none bg-[#f8fafc] p-0 shadow-2xl sm:max-w-5xl flex flex-col">
                <DialogHeader className="sticky top-0 z-20 flex flex-row items-center justify-between space-y-0 border-b border-slate-200 bg-white px-6 py-4 shrink-0">
                    <div>
                        <DialogTitle className="text-xl font-bold leading-6 text-slate-800">
                            Chỉnh sửa phiếu sửa chữa
                        </DialogTitle>
                        <p className="mt-1 text-sm text-slate-500 font-normal">
                            Cập nhật thông tin thiết bị, trạng thái và chi phí.
                        </p>
                    </div>
                    <DialogClose asChild>
                        <button className="rounded-full bg-slate-50 p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none">
                            <X className="h-6 w-6" />
                        </button>
                    </DialogClose>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    <EditRepairForm
                        repair={repair}
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