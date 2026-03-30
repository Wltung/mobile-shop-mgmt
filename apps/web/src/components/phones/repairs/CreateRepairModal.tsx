// apps/web/src/components/repairs/CreateRepairModal.tsx
'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import CreateRepairForm from './CreateRepairForm'
import { X } from 'lucide-react'
import RepairPreviewModal from '@/components/print/RepairPreviewModal'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function CreateRepairModal({ isOpen, onClose, onSuccess }: Props) {
    const [printRepairId, setPrintRepairId] = useState<number | null>(null)

    const handleFormSuccess = (dataToPrint?: { repairId: number }) => {
        if (dataToPrint?.repairId) {
            setPrintRepairId(dataToPrint.repairId)
        } else {
            onSuccess()
            onClose()
        }
    }

    const handleClosePrint = () => {
        setPrintRepairId(null)
        onSuccess()
        onClose()
    }

    return (
        <>
            <Dialog open={isOpen && !printRepairId} onOpenChange={onClose}>
                {/* max-w-5xl để modal mở rộng ra, chứa được 2 cột */}
                <DialogContent className="max-w-5xl p-0 overflow-hidden bg-[#f8fafc] flex flex-col max-h-[90vh]">
                    <DialogHeader className="flex flex-row items-center justify-between space-y-0 px-6 py-4 border-b border-slate-200 bg-white">
                        <DialogTitle className="text-xl font-bold text-slate-800">
                            Tiếp nhận máy sửa
                        </DialogTitle>
                        <DialogClose asChild>
                            <button className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none">
                                <X className="h-6 w-6" />
                            </button>
                        </DialogClose>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden">
                        <CreateRepairForm onSuccess={handleFormSuccess} onCancel={onClose} />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal In Phiếu Hẹn */}
            {printRepairId && (
                <RepairPreviewModal
                    isOpen={!!printRepairId}
                    onClose={handleClosePrint}
                    repairId={printRepairId}
                />
            )}
        </>
    )
}