import AuthBannerLayout from "./AuthBannerLayout";

// apps/web/src/components/auth/EmailSentBanner.tsx
export default function EmailSentBanner() {
    return (
        <AuthBannerLayout
            title="Kiểm tra hộp thư của bạn"
            description="Liên kết xác thực đã được gửi đi. Vui lòng làm theo hướng dẫn trong email để tiếp tục."
            backgroundImage="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop"
        />
    )
}
