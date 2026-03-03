// apps/web/src/components/common/badges/WarrantyStatusBadge.tsx
import { WarrantyStatus } from '@/types/warranty'
import { Wrench, CheckCircle2, XCircle, ClipboardList } from 'lucide-react'

interface Props {
    status: WarrantyStatus | string
    className?: string
}

export default function WarrantyStatusBadge({ status, className = '' }: Props) {
    const config: Record<string, { label: string; class: string; icon: any }> = {
        RECEIVED: {
            label: 'Đã tiếp nhận',
            class: 'bg-[#e0f2fe] text-[#0284c7] border-transparent', // Chuẩn màu mockup
            icon: ClipboardList, // Hoặc bạn dùng thẻ div tròn nhỏ để làm dấu chấm
        },
        PROCESSING: {
            label: 'Đang xử lý',
            class: 'bg-amber-100 text-amber-700 border-amber-200',
            icon: Wrench,
        },
        DONE: {
            label: 'Đã trả khách',
            class: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            icon: CheckCircle2,
        },
        CANCELLED: {
            label: 'Đã huỷ',
            class: 'bg-red-100 text-red-700 border-red-200',
            icon: XCircle,
        },
    }

    const current = config[status] || config.RECEIVED
    const Icon = current.icon

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${current.class} ${className}`}
        >
            {/* Nếu là RECEIVED thì vẽ dấu chấm tròn như mockup, ngược lại dùng Icon */}
            {status === 'RECEIVED' ? (
                <div className="h-2 w-2 rounded-full bg-[#0ea5e9]"></div>
            ) : (
                <Icon className="h-4 w-4" />
            )}
            {current.label}
        </span>
    )
}