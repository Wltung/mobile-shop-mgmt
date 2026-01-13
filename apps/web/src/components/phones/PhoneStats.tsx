import { Package, DollarSign } from 'lucide-react'

interface PhoneStatsProps {
    totalPhones: number
    totalValue: number
    formatCurrency: (val: number) => string
}

export default function PhoneStats({
    totalPhones,
    totalValue,
    formatCurrency,
}: PhoneStatsProps) {
    return (
        <div className="flex flex-1 flex-wrap gap-4">
            <div className="flex min-w-[200px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-primary">
                    <Package className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Tổng máy kho
                    </span>
                    <span className="text-lg font-bold text-[#0f172a]">
                        {totalPhones} máy
                    </span>
                </div>
            </div>
            <div className="flex min-w-[200px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
                    <DollarSign className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Tổng giá trị nhập
                    </span>
                    <span className="text-lg font-bold text-[#0f172a]">
                        {formatCurrency(totalValue)}
                    </span>
                </div>
            </div>
        </div>
    )
}
