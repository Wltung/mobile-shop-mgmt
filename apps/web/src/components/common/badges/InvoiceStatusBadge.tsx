import { InvoiceStatus } from '@/types/invoice'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'

interface Props {
    status: InvoiceStatus | string
    className?: string
}

export default function InvoiceStatusBadge({ status, className = '' }: Props) {
    const config: any = {
        PAID: {
            label: 'Đã thanh toán',
            class: 'bg-green-100 text-green-700 border-green-200',
            icon: CheckCircle2,
        },
        DRAFT: {
            label: 'Chờ thanh toán',
            class: 'bg-amber-100 text-amber-700 border-amber-200',
            icon: Clock,
        },
        CANCELLED: {
            label: 'Đã huỷ',
            class: 'bg-red-100 text-red-700 border-red-200',
            icon: XCircle,
        },
    }
    const current = config[status] || config.DRAFT
    const Icon = current.icon

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${current.class}`}
        >
            <Icon className="h-4 w-4" />
            {current.label}
        </span>
    )
}
