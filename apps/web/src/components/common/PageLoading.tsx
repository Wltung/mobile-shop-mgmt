import { Loader2 } from 'lucide-react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'

interface Props {
    title?: string // Tiêu đề header (tuỳ chọn)
}

export default function PageLoading({ title = 'Đang tải dữ liệu...' }: Props) {
    return (
        <div className="flex h-screen flex-col bg-[#f8fafc]">
            {/* Nếu truyền title thì hiện Header, không thì thôi hoặc hiện header mặc định */}
            <DashboardHeader title={title} />

            <div className="flex flex-1 items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-slate-500">
                        Vui lòng đợi...
                    </p>
                </div>
            </div>
        </div>
    )
}
