// src/styles/fonts.ts
import { Inter } from 'next/font/google'

// Cấu hình font Inter (hoặc font khác tùy bạn)
export const fontSans = Inter({
    subsets: ['latin', 'vietnamese'], // Thêm hỗ trợ tiếng Việt
    variable: '--font-sans',          // Biến CSS để Tailwind dùng
    display: 'swap',
})