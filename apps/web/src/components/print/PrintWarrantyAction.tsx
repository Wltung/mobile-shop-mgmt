'use client'

import { useState } from 'react'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import WarrantyPreviewModal from '@/components/print/WarrantyPreviewModal'

interface Props {
    warrantyId?: number | null
    className?: string
    variant?: 'default' | 'outline' | 'ghost' | 'secondary' // Thêm variant để dễ tuỳ biến
}

export default function PrintWarrantyAction({ warrantyId, className = '', variant = 'default' }: Props) {
    const [isOpen, setIsOpen] = useState(false)

    // Chỉ cho in khi có ID
    const canPrint = Boolean(warrantyId && warrantyId > 0)

    return (
        <>
            <Button
                variant={variant}
                onClick={() => setIsOpen(true)}
                disabled={!canPrint}
                className={`gap-2 transition-all ${
                    canPrint
                        ? (variant === 'default' ? 'bg-primary text-white shadow-md hover:bg-blue-600' : '')
                        : 'cursor-not-allowed bg-slate-300 text-white shadow-none'
                } ${className}`}
            >
                <Printer className="h-4 w-4" />
                <span>In phiếu bảo hành</span>
            </Button>

            {isOpen && warrantyId && (
                <WarrantyPreviewModal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    warrantyId={warrantyId}
                />
            )}
        </>
    )
}