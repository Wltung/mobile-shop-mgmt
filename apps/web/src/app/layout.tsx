import type { Metadata } from 'next'
import { fontSans } from '@/styles/fonts'
import { cn } from "@/lib/utils";
import '@/styles/globals.css'
// Import Toaster của Shadcn để hiển thị thông báo
import { Toaster } from '@/components/ui/toaster'

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
        <html lang="vi" suppressHydrationWarning>
            <body 
                className={cn(
                    "min-h-screen bg-background font-sans antialiased",
                    fontSans.variable
                )}
            >
                {/* Nội dung chính của các trang con sẽ nằm ở đây */}
                {children}

                {/* Component hiển thị thông báo (Toast) nằm đè lên trên cùng */}
                <Toaster />
            </body>
        </html>
    )
}
