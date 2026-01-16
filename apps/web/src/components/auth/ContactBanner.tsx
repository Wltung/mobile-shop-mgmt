import { Store } from 'lucide-react'

export default function ContactBanner() {
    return (
        <div className="relative hidden w-5/12 flex-col justify-end overflow-hidden bg-slate-900 lg:flex">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <img
                    alt="Abstract technology background"
                    className="h-full w-full object-cover opacity-60"
                    src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101922] via-[#101922]/60 to-primary/20 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#101922]/90 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 mb-8 p-12">
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
                        <Store className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-white">
                        MobileManager
                    </span>
                </div>

                <h1 className="mb-4 text-4xl font-bold leading-tight text-white">
                    Quản lý cửa hàng thông minh & Hiệu quả
                </h1>

                <p className="max-w-md text-lg text-slate-300">
                    Hệ thống quản lý bán hàng toàn diện giúp tối ưu hóa quy
                    trình và tăng trưởng doanh thu cho cửa hàng di động của bạn.
                </p>

                {/* Indicators (Dots) */}
                <div className="mt-8 flex gap-2">
                    <div className="h-1.5 w-8 rounded-full bg-primary"></div>
                    <div className="h-1.5 w-2 rounded-full bg-slate-600"></div>
                    <div className="h-1.5 w-2 rounded-full bg-slate-600"></div>
                </div>
            </div>
        </div>
    )
}
