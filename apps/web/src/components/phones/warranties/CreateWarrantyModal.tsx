// apps/web/src/components/phones/warranties/CreateWarrantyModal.tsx
'use client'

import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { X } from 'lucide-react'
import CreateWarrantyForm from './CreateWarrantyForm'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function CreateWarrantyModal({ isOpen, onClose, onSuccess }: Props) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden max-h-[95vh] flex flex-col rounded-2xl border-none shadow-2xl">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 px-6 py-4 bg-white border-b border-slate-200 shrink-0">
                    <div>
                        <DialogTitle className="text-xl font-bold text-slate-800">Tạo phiếu bảo hành mới</DialogTitle>
                    </div>
                    <DialogClose asChild>
                        <button className="rounded-full bg-slate-50 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </DialogClose>
                </DialogHeader>
                
                <div className="flex-1 overflow-hidden">
                    <CreateWarrantyForm 
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