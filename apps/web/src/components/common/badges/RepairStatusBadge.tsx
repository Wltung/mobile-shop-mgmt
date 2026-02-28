// apps/web/src/components/common/badges/RepairStatusBadge.tsx
import { RepairStatus } from '@/types/repair'
import { Wrench, Clock, CheckCircle2, PhoneCall, PackageCheck } from 'lucide-react'

interface Props {
    status: RepairStatus | string
    className?: string
}

export default function RepairStatusBadge({ status, className = '' }: Props) {
    const config: Record<string, { label: string; class: string; icon: any }> = {
        PENDING: {
            label: 'Chờ kiểm tra',
            class: 'bg-slate-100 text-slate-700 border-slate-200',
            icon: Clock,
        },
        REPAIRING: {
            label: 'Đang sửa',
            class: 'bg-amber-100 text-amber-700 border-amber-200',
            icon: Wrench,
        },
        WAITING_CUSTOMER: {
            label: 'Chờ khách',
            class: 'bg-blue-100 text-blue-700 border-blue-200',
            icon: PhoneCall,
        },
        COMPLETED: {
            label: 'Hoàn thành',
            class: 'bg-green-100 text-green-700 border-green-200',
            icon: CheckCircle2,
        },
        DELIVERED: {
            label: 'Đã giao',
            class: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            icon: PackageCheck,
        },
    }

    const current = config[status] || config.PENDING
    const Icon = current.icon

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${current.class} ${className}`}
        >
            <Icon className="h-4 w-4" />
            {current.label}
        </span>
    )
}