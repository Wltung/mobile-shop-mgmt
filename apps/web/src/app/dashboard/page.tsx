'use client'

import { useAuthStore } from '@/store/useAuthStore'
import {
    Bell,
    HelpCircle,
    Search,
    PlusCircle,
    QrCode,
    UserPlus,
    TrendingUp,
    AlertCircle,
    Package,
    DollarSign,
} from 'lucide-react'

export default function DashboardPage() {
    const user = useAuthStore((state) => state.user)

    return (
        <>
            {/* Header */}
            <header className="z-10 flex flex-none items-center justify-between whitespace-nowrap border-b border-slate-200 bg-white px-8 py-4">
                <div className="flex items-center gap-4 text-[#0f172a]">
                    <h2 className="text-xl font-bold leading-tight tracking-tight">
                        Dashboard Overview
                    </h2>
                </div>
                <div className="flex flex-1 justify-end gap-6">
                    <div className="flex items-center gap-2">
                        <button className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-blue-50 hover:text-blue-600">
                            <Bell className="h-5 w-5" />
                        </button>
                        <button className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-blue-50 hover:text-blue-600">
                            <HelpCircle className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-500">
                            {/* Avatar giả lập lấy chữ cái đầu */}
                            {user?.full_name?.charAt(0) || 'A'}
                        </div>
                        <div className="hidden flex-col md:flex">
                            <span className="text-sm font-bold text-[#0f172a]">
                                {user?.full_name || 'Admin User'}
                            </span>
                            <span className="text-xs capitalize text-slate-500">
                                {user?.role || 'Manager'}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
                    {/* Search Bar */}
                    <div className="w-full">
                        <div className="flex h-14 w-full items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500">
                            <div className="flex items-center justify-center pl-6 text-slate-400">
                                <Search className="h-5 w-5" />
                            </div>
                            <input
                                className="flex h-full w-full min-w-0 flex-1 border-none bg-transparent px-4 text-base text-[#0f172a] placeholder:text-slate-400 focus:outline-0"
                                placeholder="Search for orders, products, customers..."
                            />
                            <div className="pr-2">
                                <button className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-600">
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <section className="flex flex-col gap-4">
                        <h3 className="text-lg font-bold text-[#0f172a]">
                            Quick Actions
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                {
                                    icon: PlusCircle,
                                    title: 'Create Order',
                                    desc: 'Process a new customer order',
                                },
                                {
                                    icon: Package,
                                    title: 'Add Product',
                                    desc: 'Add new items to inventory',
                                },
                                {
                                    icon: QrCode,
                                    title: 'Check Stock',
                                    desc: 'Check availability of items',
                                },
                                {
                                    icon: UserPlus,
                                    title: 'Add Customer',
                                    desc: 'Register a new client profile',
                                },
                            ].map((item, idx) => (
                                <button
                                    key={idx}
                                    className="group flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
                                >
                                    <div className="rounded-full bg-blue-50 p-3 text-blue-500 transition-colors group-hover:bg-blue-500 group-hover:text-white">
                                        <item.icon className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-[#0f172a]">
                                            {item.title}
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            {item.desc}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Performance Stats (Tĩnh - Vô hồn như yêu cầu) */}
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-[#0f172a]">
                                Performance Overview
                            </h3>
                            <button className="text-sm font-bold text-blue-500 hover:underline">
                                View All Reports
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {/* Stat 1 */}
                            <div className="flex min-w-[200px] flex-1 flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">
                                            Today's Revenue
                                        </p>
                                        <p className="text-3xl font-bold text-[#0f172a]">
                                            $1,240.50
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 p-2 text-slate-400">
                                        <DollarSign className="h-6 w-6" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center rounded bg-green-50 px-2 py-0.5 text-xs font-bold text-green-700">
                                        <TrendingUp className="mr-1 h-3 w-3" />{' '}
                                        12%
                                    </span>
                                    <p className="text-xs text-slate-500">
                                        vs yesterday
                                    </p>
                                </div>
                            </div>

                            {/* Stat 2 */}
                            <div className="flex min-w-[200px] flex-1 flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">
                                            Pending Orders
                                        </p>
                                        <p className="text-3xl font-bold text-[#0f172a]">
                                            8
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 p-2 text-slate-400">
                                        <AlertCircle className="h-6 w-6" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center rounded bg-orange-50 px-2 py-0.5 text-xs font-bold text-orange-600">
                                        Needs attention
                                    </span>
                                    <p className="text-xs text-slate-500">
                                        Shipment pending
                                    </p>
                                </div>
                            </div>

                            {/* Stat 3 */}
                            <div className="flex min-w-[200px] flex-1 flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">
                                            Low Stock Alerts
                                        </p>
                                        <p className="text-3xl font-bold text-[#0f172a]">
                                            3{' '}
                                            <span className="text-base font-normal text-slate-400">
                                                items
                                            </span>
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 p-2 text-slate-400">
                                        <Package className="h-6 w-6" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center rounded bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">
                                        Critical
                                    </span>
                                    <p className="text-xs text-slate-500">
                                        Restock soon
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    )
}
