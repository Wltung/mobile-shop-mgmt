// src/components/common/detail/DetailCard.tsx
import { ReactNode } from 'react'

interface DetailCardProps {
    title: string
    icon: ReactNode
    children: ReactNode
    className?: string
    action?: ReactNode // Nút bấm phụ ở góc phải card (nếu cần)
}

export default function DetailCard({
    title,
    icon,
    children,
    className,
    action,
}: DetailCardProps) {
    return (
        <div
            className={`flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
        >
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <div className="flex items-center gap-2">
                    {icon}
                    <h3 className="font-bold text-slate-900">{title}</h3>
                </div>
                {action && <div>{action}</div>}
            </div>

            {/* Card Body */}
            <div className="flex flex-1 flex-col justify-center space-y-6 p-6 text-sm">
                {children}
            </div>
        </div>
    )
}
