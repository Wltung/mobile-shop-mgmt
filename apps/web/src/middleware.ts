import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 1. Định nghĩa các Route cần bảo vệ và Route Auth
const protectedRoutes = ['/dashboard']
const authRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/contact',
]

export function middleware(request: NextRequest) {
    // Lấy token từ Cookie (HttpOnly Cookie được gửi kèm request)
    const token = request.cookies.get('access_token')?.value

    const { pathname } = request.nextUrl

    // CASE 1: Đang vào trang Dashboard (Protected) mà KHÔNG có token
    // -> Đá về Login
    if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
        const loginUrl = new URL('/login', request.url)
        // (Optional) Lưu lại trang họ muốn vào để login xong redirect ngược lại
        loginUrl.searchParams.set('from', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // CASE 2: Đang vào trang Auth (Login/Register...) mà ĐÃ CÓ token
    // -> Đá thẳng vào Dashboard (Không cho login lại)
    if (authRoutes.some((route) => pathname.startsWith(route)) && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // CASE 3: Các trường hợp khác -> Cho đi qua bình thường
    return NextResponse.next()
}

// Cấu hình Matcher để Middleware chỉ chạy trên các route cụ thể
// Giúp tối ưu hiệu năng, không chạy trên static file, image, api...
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    ],
}
