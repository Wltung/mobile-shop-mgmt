// src/components/common/badges/PhoneStatusBadge.tsx
import { PhoneStatus } from '@/types/phone'

interface Props {
    status: PhoneStatus | string
    className?: string
}

export default function PhoneStatusBadge({ status, className = '' }: Props) {
    const styles: Record<string, string> = {
        IN_STOCK: 'bg-green-100 text-green-700 border-green-200',
        SOLD: 'bg-slate-100 text-slate-700 border-slate-200',
        REPAIRING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    }

    const labels: Record<string, string> = {
        IN_STOCK: 'Trong kho',
        SOLD: 'Đã bán',
        REPAIRING: 'Đang sửa',
    }

    const currentStyle = styles[status] || 'bg-gray-100 text-gray-700 border-gray-200'
    const currentLabel = labels[status] || status

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium shadow-sm ${currentStyle} ${className}`}
        >
            <div
                className={`mr-2 h-1.5 w-1.5 rounded-full ${
                    status === 'IN_STOCK' ? 'bg-green-500' : 'bg-current'
                }`}
            ></div>
            {currentLabel}
        </span>
    )
}