'use client'

import { useAuthStore } from '@/store/useAuthStore'
import {
    Bell,
    HelpCircle,
    Search,
    TrendingUp,
    Menu,
    Download,
    Smartphone,
    Wrench,
    ShieldCheck,
    Home,
    ShoppingBag,
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
    const user = useAuthStore((state) => state.user)

    return (
        <>
            {/* HEADER: Tổng quan Hệ thống */}
            <header className="z-10 flex flex-none items-center justify-between whitespace-nowrap border-b border-slate-200 bg-white px-8 py-4">
                <div className="flex items-center gap-4 text-[#0f172a]">
                    <div className="cursor-pointer lg:hidden">
                        <Menu className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-bold leading-tight tracking-tight text-[#0f172a]">
                        Tổng quan Hệ thống
                    </h2>
                </div>

                <div className="flex flex-1 justify-end gap-6">
                    <div className="flex items-center gap-2">
                        <button className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-[#0f172a] transition-colors hover:bg-primary/10 hover:text-primary">
                            <Bell className="h-5 w-5" />
                        </button>
                        <button className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-[#0f172a] transition-colors hover:bg-primary/10 hover:text-primary">
                            <HelpCircle className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                        {/* Avatar - Dùng ảnh thật hoặc chữ cái đầu */}
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-200 shadow-sm ring-2 ring-white">
                            <span className="text-lg font-bold text-slate-500">
                                {user?.full_name?.charAt(0).toUpperCase() ||
                                    'A'}
                            </span>
                        </div>
                        <div className="hidden flex-col md:flex">
                            <span className="text-sm font-bold text-[#0f172a]">
                                {user?.full_name || 'Quản lý cửa hàng'}
                            </span>
                            <span className="text-xs capitalize text-muted">
                                {user?.role === 'admin'
                                    ? 'Quản trị viên'
                                    : 'Nhân viên'}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-6 lg:p-10">
                <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
                    {/* SEARCH BAR */}
                    <div className="w-full">
                        <label className="flex w-full flex-col">
                            <div className="flex h-14 w-full items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary">
                                <div className="flex items-center justify-center pl-6 text-muted">
                                    <Search className="h-5 w-5" />
                                </div>
                                <input
                                    className="flex h-full w-full min-w-0 flex-1 resize-none overflow-hidden border-none bg-transparent px-4 text-base font-normal leading-normal text-[#0f172a] placeholder:text-muted focus:outline-0"
                                    placeholder="Tìm kiếm IMEI, tên khách hàng, đời máy..."
                                />
                                <div className="flex items-center pr-2">
                                    <button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm shadow-blue-500/30 transition-colors hover:bg-blue-600">
                                        Tìm kiếm
                                    </button>
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* THAO TÁC NHANH (QUICK ACTIONS) */}
                    <section className="flex flex-col gap-4">
                        <h3 className="text-lg font-bold leading-tight text-[#0f172a]">
                            Thao tác nhanh
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Card 1: Nhập máy */}
                            <Link
                                href="/dashboard/import"
                                className="group flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                            >
                                <div className="rounded-full bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                                    <Download className="h-7 w-7" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-base font-bold leading-tight text-[#0f172a]">
                                        Nhập máy
                                    </h2>
                                    <p className="text-sm font-normal leading-normal text-muted">
                                        Nhập máy mới vào hệ thống
                                    </p>
                                </div>
                            </Link>

                            {/* Card 2: Bán máy */}
                            <Link
                                href="/dashboard/sales"
                                className="group flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                            >
                                <div className="rounded-full bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                                    <Smartphone className="h-7 w-7" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-base font-bold leading-tight text-[#0f172a]">
                                        Bán máy
                                    </h2>
                                    <p className="text-sm font-normal leading-normal text-muted">
                                        Lập đơn bán máy cho khách
                                    </p>
                                </div>
                            </Link>

                            {/* Card 3: Sửa máy */}
                            <Link
                                href="/dashboard/repairs"
                                className="group flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                            >
                                <div className="rounded-full bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                                    <Wrench className="h-7 w-7" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-base font-bold leading-tight text-[#0f172a]">
                                        Sửa máy
                                    </h2>
                                    <p className="text-sm font-normal leading-normal text-muted">
                                        Quản lý máy sửa chữa
                                    </p>
                                </div>
                            </Link>

                            {/* Card 4: Bảo hành */}
                            <Link
                                href="/dashboard/warranty"
                                className="group flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                            >
                                <div className="rounded-full bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                                    <ShieldCheck className="h-7 w-7" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-base font-bold leading-tight text-[#0f172a]">
                                        Bảo hành
                                    </h2>
                                    <p className="text-sm font-normal leading-normal text-muted">
                                        Tra cứu phiếu bảo hành
                                    </p>
                                </div>
                            </Link>
                        </div>
                    </section>

                    {/* HIỆU SUẤT KINH DOANH (STATS) */}
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold leading-tight text-[#0f172a]">
                                Hiệu suất kinh doanh
                            </h3>
                            <button className="text-sm font-bold text-primary hover:underline">
                                Xem tất cả báo cáo
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            {/* Stat 1: Doanh thu */}
                            <div className="flex min-w-[200px] flex-1 flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-medium leading-normal text-muted">
                                            Doanh thu hôm nay
                                        </p>
                                        <p className="text-3xl font-bold leading-tight tracking-tight text-[#0f172a]">
                                            1.240.500 ₫
                                        </p>
                                    </div>
                                    <span className="rounded-lg bg-slate-100 p-2 text-slate-500">
                                        <Smartphone className="h-6 w-6" />
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center rounded bg-[#078838]/10 px-2 py-0.5 text-xs font-bold text-[#078838]">
                                        <TrendingUp className="mr-0.5 h-4 w-4" />{' '}
                                        12%
                                    </span>
                                    <p className="text-xs font-medium leading-normal text-muted">
                                        so với hôm qua
                                    </p>
                                </div>
                            </div>

                            {/* Stat 2: Số lượng sửa */}
                            <div className="flex min-w-[200px] flex-1 flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-medium leading-normal text-muted">
                                            Số lượng máy sửa
                                        </p>
                                        <p className="text-3xl font-bold leading-tight tracking-tight text-[#0f172a]">
                                            8
                                        </p>
                                    </div>
                                    <span className="rounded-lg bg-slate-100 p-2 text-slate-500">
                                        <Home className="h-6 w-6" />
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center rounded bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-600">
                                        Hôm nay
                                    </span>
                                    <p className="text-xs font-medium leading-normal text-muted">
                                        Trong ngày
                                    </p>
                                </div>
                            </div>

                            {/* Stat 3: Số lượng bán */}
                            <div className="flex min-w-[200px] flex-1 flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-medium leading-normal text-muted">
                                            Số lượng máy bán
                                        </p>
                                        <p className="text-3xl font-bold leading-tight tracking-tight text-[#0f172a]">
                                            3{' '}
                                            <span className="text-base font-normal text-slate-500">
                                                máy
                                            </span>
                                        </p>
                                    </div>
                                    <span className="rounded-lg bg-slate-100 p-2 text-slate-500">
                                        <ShoppingBag className="h-6 w-6" />
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-600">
                                        Trong tuần
                                    </span>
                                    <p className="text-xs font-medium leading-normal text-muted">
                                        Đã hoàn thành
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
