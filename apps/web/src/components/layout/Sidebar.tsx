'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    FileText,
    Settings,
    LogOut,
    Smartphone,
    Download,
    Wrench,
    ShieldCheck,
    BarChart3,
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { cn } from '@/lib/utils' // Tiện ích class của shadcn (nếu có)

export default function Sidebar() {
    const router = useRouter()
    const pathname = usePathname()
    const logout = useAuthStore((state) => state.logout)

    const handleLogout = async () => {
        await logout()
        router.push('/login')
    }

    // Mảng menu để render cho gọn
    const menuItems = [
        { icon: LayoutDashboard, label: 'Trang chủ', href: '/dashboard' },
        { icon: Smartphone, label: 'Bán máy', href: '/dashboard/sales' },
        { icon: Download, label: 'Nhập máy', href: '/dashboard/import' }, // Icon Download cho "Nhập"
        { icon: Wrench, label: 'Sửa chữa', href: '/dashboard/repairs' },
        { icon: ShieldCheck, label: 'Bảo hành', href: '/dashboard/warranties' },
        { icon: FileText, label: 'Hoá đơn', href: '/dashboard/invoices' },
        { icon: BarChart3, label: 'Báo cáo', href: '/dashboard/reports' },
    ]

    return (
        <aside className="z-20 flex h-full w-64 flex-none flex-col overflow-y-auto bg-sidebar text-white transition-colors">
            {/* Logo Section */}
            <div className="flex items-center gap-3 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary/30 bg-[url('https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?q=80&w=100&auto=format&fit=crop')] bg-cover bg-center shadow-sm"></div>
                <h1 className="text-lg font-bold leading-normal tracking-wide text-white">
                    ShopManager
                </h1>
            </div>

            {/* Nav Menu */}
            <nav className="flex flex-1 flex-col gap-2 px-4">
                {menuItems.map((item, index) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={index}
                            href={item.href}
                            className={cn(
                                'group flex items-center gap-3 rounded-lg px-3 py-3 transition-all',
                                isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'text-slate-400 hover:bg-sidebar-hover hover:text-white',
                            )}
                        >
                            <item.icon
                                className={cn(
                                    'h-5 w-5 transition-colors',
                                    isActive
                                        ? 'text-white'
                                        : 'text-blue-400 group-hover:text-white',
                                )}
                            />
                            <span className="text-sm font-semibold leading-normal">
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer Actions */}
            <div className="mt-auto border-t border-slate-800 p-4">
                <Link
                    href="/dashboard/settings"
                    className="group flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400 transition-all hover:bg-sidebar-hover hover:text-white"
                >
                    <Settings className="h-5 w-5 text-blue-400 transition-colors group-hover:text-white" />
                    <span className="text-sm font-medium leading-normal">
                        Cài đặt
                    </span>
                </Link>

                <button
                    onClick={handleLogout}
                    className="group mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-slate-400 transition-all hover:bg-sidebar-hover hover:text-white"
                >
                    <LogOut className="h-5 w-5 text-blue-400 transition-colors group-hover:text-white" />
                    <span className="text-sm font-medium leading-normal">
                        Đăng xuất
                    </span>
                </button>
            </div>
        </aside>
    )
}
