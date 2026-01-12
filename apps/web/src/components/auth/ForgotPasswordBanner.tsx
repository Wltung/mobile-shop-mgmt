// apps/web/src/components/auth/ForgotPasswordBanner.tsx
export default function ForgotPasswordBanner() {
    return (
        <div className="relative hidden flex-col justify-end overflow-hidden bg-[#101922] lg:flex lg:w-1/2">
            {/* Background Image - Ảnh kỹ thuật viên sửa điện thoại */}
            <div
                className="absolute inset-0 h-full w-full bg-cover bg-center opacity-60"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1591196155989-8755b7470223?q=80&w=2070&auto=format&fit=crop')",
                }}
            ></div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-primary/10 mix-blend-multiply"></div>

            {/* Content */}
            <div className="relative z-10 p-12 text-white">
                <h2 className="mb-4 text-4xl font-bold">Mobile Shop Manager</h2>
                <p className="max-w-md text-lg opacity-90">
                    Khôi phục quyền truy cập vào hệ thống quản lý cửa hàng của
                    bạn một cách an toàn và nhanh chóng.
                </p>
            </div>
        </div>
    )
}
