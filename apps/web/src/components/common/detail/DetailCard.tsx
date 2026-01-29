// src/components/common/detail/DetailCard.tsx
import { ReactNode } from 'react'

interface DetailCardProps {
    title: string
    icon: ReactNode
    children: ReactNode
    className?: string
    action?: ReactNode
    iconClassName?: string
}

export default function DetailCard({
    title,
    icon,
    children,
    className,
    action,
    iconClassName = 'bg-slate-100 text-slate-600',
}: DetailCardProps) {
    return (
        <div
            className={`flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
        >
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <div className="flex items-center gap-3">
                    {/* Áp dụng iconClassName vào div bao ngoài icon */}
                    <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconClassName}`}
                    >
                        {icon}
                    </div>
                    <h3 className="font-bold text-slate-800">{title}</h3>
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
