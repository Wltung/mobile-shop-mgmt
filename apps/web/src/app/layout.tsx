import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
// Import Toaster của Shadcn để hiển thị thông báo
import { Toaster } from '@/components/ui/toaster'

// Cấu hình Font Inter (hỗ trợ tiếng Việt)
const inter = Inter({
    subsets: ['latin', 'vietnamese'],
    display: 'swap',
    variable: '--font-inter',
})

export const metadata: Metadata = {
    title: 'ShopMaster Pro',
    description: 'Hệ thống quản lý cửa hàng điện thoại chuyên nghiệp',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="vi">
            <body className={`${inter.className} antialiased`}>
                {/* Nội dung chính của các trang con sẽ nằm ở đây */}
                {children}

                {/* Component hiển thị thông báo (Toast) nằm đè lên trên cùng */}
                <Toaster />
            </body>
        </html>
    )
}
