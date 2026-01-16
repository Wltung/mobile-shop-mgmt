// apps/web/src/app/reset-password/page.tsx
import { Suspense } from 'react'
import { Metadata } from 'next'
import ResetPasswordBanner from '@/components/auth/ResetPasswordBanner'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
    title: 'Đặt lại mật khẩu - ShopMaster Pro',
    description: 'Thiết lập mật khẩu mới cho tài khoản của bạn',
}

// Component loading dự phòng khi đang đọc URL
function ResetFallback() {
    return (
        <div className="flex w-full flex-col items-center justify-center lg:w-1/2">
            <div className="animate-pulse">Đang tải dữ liệu...</div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-screen w-full flex-row overflow-hidden font-display">
            <ResetPasswordBanner />

            {/* Suspense Boundary bắt buộc khi dùng useSearchParams */}
            <Suspense fallback={<ResetFallback />}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    )
}
