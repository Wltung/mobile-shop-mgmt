import { Store } from 'lucide-react'

interface AuthBannerLayoutProps {
    title: string
    description: string
    backgroundImage: string
}

export default function AuthBannerLayout({ title, description, backgroundImage }: AuthBannerLayoutProps) {
    return (
        <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 lg:flex lg:w-1/2 p-12">
            {/* 1. Nền và Hiệu ứng chung */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay"
                    style={{ backgroundImage: `url('${backgroundImage}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-slate-900/90 mix-blend-multiply" />
            </div>

            {/* 2. Content */}
            <div className="relative z-10 flex h-full flex-col justify-between text-white">
                {/* Logo cố định */}
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                        <Store className="h-6 w-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">
                        MobileManager
                    </span>
                </div>

                {/* Text linh động */}
                <div className="max-w-md">
                    <h2 className="mb-4 text-4xl font-bold leading-tight">
                        {title}
                    </h2>
                    <p className="text-lg text-slate-300">
                        {description}
                    </p>
                </div>

                {/* Footer cố định & Links */}
                <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>© 2026 MobileManager Platform.</span>
                    <div className="flex items-center gap-6">
                        <a href="#" className="transition-colors hover:text-white">
                        Chính sách bảo mật
                        </a>
                        <a href="#" className="transition-colors hover:text-white">
                            Điều khoản dịch vụ
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}