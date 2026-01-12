import { Metadata } from 'next'
import EmailSentBanner from '@/components/auth/EmailSentBanner'
import EmailSentContent from '@/components/auth/EmailSentContent'

export const metadata: Metadata = {
    title: 'Đã gửi Email - ShopMaster Pro',
    description: 'Xác nhận gửi email khôi phục mật khẩu',
}

export default function EmailSentPage() {
    return (
        <div className="flex min-h-screen w-full flex-row overflow-hidden font-display">
            <EmailSentBanner />
            <EmailSentContent />
        </div>
    )
}
