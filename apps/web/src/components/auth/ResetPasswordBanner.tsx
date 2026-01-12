// apps/web/src/components/auth/ResetPasswordBanner.tsx
import { Smartphone } from 'lucide-react'

export default function ResetPasswordBanner() {
    return (
        <div className="relative hidden overflow-hidden bg-slate-900 lg:flex lg:w-1/2">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop')",
                }}
            ></div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-slate-900/90 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#101922]/80 via-transparent to-transparent"></div>

            {/* Content */}
            <div className="relative z-10 flex h-full w-full flex-col justify-between p-12 text-white">
                <div className="flex items-center gap-3">
                    <Smartphone className="h-10 w-10 text-white" />
                    <span className="text-xl font-bold uppercase tracking-wide">
                        TechManager
                    </span>
                </div>

                <div className="max-w-md">
                    <h2 className="mb-4 text-4xl font-bold leading-tight">
                        Quản lý cửa hàng thông minh & hiệu quả
                    </h2>
                    <p className="text-lg text-slate-300">
                        Hệ thống quản lý toàn diện giúp tối ưu hóa quy trình vận
                        hành cho cửa hàng điện thoại của bạn.
                    </p>
                </div>

                <div className="text-sm text-slate-400">
                    © 2026 TechManager Platform. All rights reserved.
                </div>
            </div>
        </div>
    )
}
