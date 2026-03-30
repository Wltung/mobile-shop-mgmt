'use client'

import { useState } from 'react'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import RepairPreviewModal from '@/components/print/RepairPreviewModal'
import { Repair } from '@/types/repair'

interface Props {
    repair: Repair | null
}

export default function PrintRepairAction({ repair }: Props) {
    const [isOpen, setIsOpen] = useState(false)

    if (!repair) return null

    // Lấy ngày hẹn trả từ JSON
    const promisedDate = repair.description_json?.promised_return_date

    // LOGIC DISABLE: 
    // 1. Là máy cửa hàng (SHOP_DEVICE_REPAIR)
    // 2. HOẶC thời gian hẹn bị null / rỗng
    const isDisabled = repair.repair_category === 'SHOP_DEVICE_REPAIR' || !promisedDate

    return (
        <>
            <Button 
                variant="outline" 
                size="sm" 
                disabled={isDisabled}
                onClick={() => setIsOpen(true)}
                className="h-7 px-2.5 text-xs font-bold text-blue-600 border-blue-200 bg-blue-50/50 hover:bg-blue-100 hover:text-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:opacity-100"
                title={isDisabled ? "Không thể in do là máy cửa hàng hoặc chưa có ngày hẹn" : "In phiếu hẹn"}
            >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                In phiếu
            </Button>

            {/* Modal In Phiếu Hẹn */}
            {isOpen && (
                <RepairPreviewModal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    repairId={repair.id}
                />
            )}
        </>
    )
}