// apps/web/src/components/repairs/CreateRepairModal.tsx
'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import CreateRepairForm from './CreateRepairForm'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function CreateRepairModal({ isOpen, onClose, onSuccess }: Props) {
    const handleSuccess = () => {
        onSuccess()
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* max-w-5xl để modal mở rộng ra, chứa được 2 cột */}
            <DialogContent className="max-w-5xl p-0 overflow-hidden bg-[#f8fafc] flex flex-col max-h-[90vh]">
                <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-white">
                    <DialogTitle className="text-xl font-bold text-slate-800">
                        Tiếp nhận máy mới sửa
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    <CreateRepairForm onSuccess={handleSuccess} onCancel={onClose} />
                </div>
            </DialogContent>
        </Dialog>
    )
}