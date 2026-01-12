// apps/web/src/components/auth/EmailSentBanner.tsx
export default function EmailSentBanner() {
    return (
        <div className="relative hidden flex-col justify-end overflow-hidden bg-[#101922] lg:flex lg:w-1/2">
            {/* Background Image - Circuit Board style */}
            <div
                className="absolute inset-0 h-full w-full bg-cover bg-center"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop')",
                }}
            ></div>

            {/* Blue Overlay giống thiết kế */}
            <div className="absolute inset-0 bg-primary/20 mix-blend-overlay backdrop-blur-[2px]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#101922] via-transparent to-transparent"></div>

            {/* Content */}
            <div className="relative z-10 p-12 text-white">
                <h2 className="mb-4 text-4xl font-bold">
                    Quản lý cửa hàng thông minh
                </h2>
                <p className="max-w-md text-lg opacity-90">
                    Hệ thống quản lý tối ưu cho doanh nghiệp bán lẻ thiết bị di
                    động.
                </p>
            </div>
        </div>
    )
}
