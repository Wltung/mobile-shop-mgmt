'use client'

import { useState } from 'react'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import InvoicePreviewModal from '@/components/print/InvoicePreviewModal'

interface Props {
    invoiceId?: number | null
    status?: string | null // PAID, DRAFT, CANCELLED...
    className?: string
}

export default function PrintInvoiceAction({ invoiceId, status, className = '' }: Props) {
    const [isOpen, setIsOpen] = useState(false)

    // Chỉ cho in khi có ID và trạng thái đã PAID
    const canPrint = Boolean(invoiceId && invoiceId > 0 && status === 'PAID')

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                disabled={!canPrint}
                className={`gap-2 text-white shadow-md transition-all ${
                    canPrint
                        ? 'bg-primary shadow-primary/20 hover:bg-blue-600'
                        : 'cursor-not-allowed bg-slate-300 shadow-none'
                } ${className}`}
            >
                <Printer className="h-4 w-4" />
                In hoá đơn
            </Button>

            {/* Render Modal khi bấm in */}
            {isOpen && invoiceId && (
                <InvoicePreviewModal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    invoiceId={invoiceId} // Chỉ cần ném ID vào đây
                />
            )}
        </>
    )
}