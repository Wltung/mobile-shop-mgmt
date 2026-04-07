// apps/web/src/components/auth/ResetPasswordBanner.tsx
import { Smartphone } from 'lucide-react'
import AuthBannerLayout from './AuthBannerLayout'

export default function ResetPasswordBanner() {
    return (
        <AuthBannerLayout
            title="Thiết lập lại bảo mật tài khoản"
            description="Hãy đặt một mật khẩu mới đủ mạnh để bảo vệ dữ liệu kinh doanh của bạn an toàn."
            backgroundImage="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop"
        />
    )
}
