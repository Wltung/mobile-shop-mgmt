'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    DollarSign,
    Package,
    ShoppingCart,
    Users,
    FileText,
    Settings,
    LogOut,
    Store,
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { cn } from '@/lib/utils' // Tiện ích class của shadcn (nếu có)

export default function Sidebar() {
    const router = useRouter()
    const logout = useAuthStore((state) => state.logout)

    const handleLogout = async () => {
        await logout()
        router.push('/login')
    }

    // Mảng menu để render cho gọn
    const menuItems = [
        {
            icon: LayoutDashboard,
            label: 'Dashboard',
            href: '/dashboard',
            active: true,
        },
        { icon: DollarSign, label: 'Sales', href: '/dashboard/sales' },
        { icon: Package, label: 'Inventory', href: '/dashboard/inventory' },
        { icon: ShoppingCart, label: 'Orders', href: '/dashboard/orders' },
        { icon: Users, label: 'Customers', href: '/dashboard/customers' },
        { icon: FileText, label: 'Reports', href: '/dashboard/reports' },
    ]

    return (
        <aside className="z-20 flex h-full w-64 flex-none flex-col overflow-y-auto bg-[#0f172a] text-white transition-colors">
            {/* Logo Section */}
            <div className="flex items-center gap-3 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-500/30 bg-blue-600 shadow-sm">
                    <Store className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-lg font-bold leading-normal tracking-wide text-white">
                    ShopManager
                </h1>
            </div>

            {/* Nav Menu */}
            <nav className="flex flex-1 flex-col gap-2 px-4">
                {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        href={item.href}
                        className={cn(
                            'group flex items-center gap-3 rounded-lg px-3 py-3 transition-all',
                            item.active
                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                : 'text-slate-400 hover:bg-[#1e293b] hover:text-white',
                        )}
                    >
                        <item.icon
                            className={cn(
                                'h-5 w-5 transition-colors',
                                item.active
                                    ? 'text-white'
                                    : 'text-blue-400 group-hover:text-white',
                            )}
                        />
                        <span className="text-sm font-semibold leading-normal">
                            {item.label}
                        </span>
                    </Link>
                ))}
            </nav>

            {/* Footer Actions */}
            <div className="mt-auto border-t border-slate-800 p-4">
                <Link
                    href="/dashboard/settings"
                    className="group flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400 transition-all hover:bg-[#1e293b] hover:text-white"
                >
                    <Settings className="h-5 w-5 text-blue-400 transition-colors group-hover:text-white" />
                    <span className="text-sm font-medium leading-normal">
                        Settings
                    </span>
                </Link>

                {/* LOGOUT BUTTON */}
                <button
                    onClick={handleLogout}
                    className="group mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-slate-400 transition-all hover:bg-[#1e293b] hover:text-red-400"
                >
                    <LogOut className="h-5 w-5 text-blue-400 transition-colors group-hover:text-red-400" />
                    <span className="text-sm font-medium leading-normal">
                        Logout
                    </span>
                </button>
            </div>
        </aside>
    )
}
