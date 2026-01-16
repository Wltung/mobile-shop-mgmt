// apps/web/src/app/forgot-password/page.tsx
import ForgotPasswordBanner from '@/components/auth/ForgotPasswordBanner'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Quên mật khẩu - ShopMaster Pro',
    description: 'Khôi phục mật khẩu tài khoản quản trị',
}

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen w-full flex-row overflow-hidden font-display">
            <ForgotPasswordBanner />
            <ForgotPasswordForm />
        </div>
    )
}
