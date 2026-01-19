// src/components/common/detail/DetailRow.tsx
import { ReactNode } from 'react'

interface DetailRowProps {
    label: string
    value: ReactNode
    isLast?: boolean // Nếu là dòng cuối thì bỏ border
}

export default function DetailRow({
    label,
    value,
    isLast = false,
}: DetailRowProps) {
    return (
        <div
            className={`flex items-center justify-between py-2 ${!isLast ? 'border-b border-dashed border-slate-100' : ''}`}
        >
            <span className="text-base text-slate-500">{label}</span>
            <div className="text-right text-lg font-medium text-slate-800">
                {value}
            </div>
        </div>
    )
}
