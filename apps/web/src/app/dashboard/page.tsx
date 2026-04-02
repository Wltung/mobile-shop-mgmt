'use client'

import { useState, useEffect } from 'react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { useAuthStore } from '@/store/useAuthStore'
import {
    Search,
    TrendingUp,
    Download,
    Smartphone,
    Wrench,
    ShieldCheck,
    Home,
    ShoppingBag,
    WrenchIcon,
    Receipt,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import WarrantyItemSearchSelect from '@/components/phones/warranties/WarrantyItemSearchSelect'
import PhoneSearchSelect from '@/components/phones/PhoneSearchSelect'

// --- DỮ LIỆU TỪ CÁC HOOK ĐÃ CÓ ---
import { usePhoneList } from '@/hooks/phone/usePhoneList'
import { useRepairList } from '@/hooks/repair/useRepairList'
import { useInvoiceList } from '@/hooks/invoice/useInvoiceList'
import { formatCurrency } from '@/lib/utils'

export default function DashboardPage() {
    const user = useAuthStore((state) => state.user)
    const router = useRouter()

    const [searchMode, setSearchMode] = useState<'PHONE' | 'SALE' | 'REPAIR'>('PHONE')

    // 1. Gọi Hook lấy dữ liệu
    const { stats: saleStats } = usePhoneList('SALE')
    const { stats: repairStats } = useRepairList()
    const { stats: invoiceStats, setDateFilter: setInvoiceDateFilter } = useInvoiceList()

    // 2. Ép hoá đơn lọc theo "Hôm nay" ngay khi vừa vào trang để lấy Doanh thu
    useEffect(() => {
        setInvoiceDateFilter('today')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handlePhoneSelect = (phone: any) => {
        router.push(`/dashboard/phones?keyword=${phone.imei}`)
    }

    const handleWarrantySelect = (item: any) => {
        router.push(`/dashboard/invoices/${item.invoice_id}`)
    }

    return (
        <>
            <DashboardHeader title="Tổng quan Hệ thống" />

            <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-6 lg:p-10">
                <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
                    {/* --- GLOBAL SEARCH SECTION GIỮ NGUYÊN --- */}
                    <div className="w-full rounded-2xl border border-slate-100 bg-white p-3 shadow-xl shadow-slate-100/50 lg:p-4">
                        <div className="mb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100/70 pb-5">
                            <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-900">
                                <Search className="h-5 w-5 text-primary" />
                                <span>Tìm kiếm thông minh</span>
                            </h3>
                            <div className="flex gap-1.5 rounded-lg bg-slate-50 p-1">
                                <button
                                    onClick={() => setSearchMode('PHONE')}
                                    className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                                        searchMode === 'PHONE'
                                            ? 'bg-primary text-white shadow-md'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                                    }`}
                                >
                                    <Smartphone className="h-4 w-4" /> 
                                    Máy kho
                                </button>
                                <button
                                    onClick={() => setSearchMode('SALE')}
                                    className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                                        searchMode === 'SALE'
                                            ? 'bg-emerald-600 text-white shadow-md'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                                    }`}
                                >
                                    <Receipt className="h-4 w-4" /> 
                                    HĐ Bán
                                </button>
                                <button
                                    onClick={() => setSearchMode('REPAIR')}
                                    className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                                        searchMode === 'REPAIR'
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                                    }`}
                                >
                                    <WrenchIcon className="h-4 w-4" /> 
                                    Phiếu sửa
                                </button>
                            </div>
                        </div>

                        <div className="relative z-50 max-w-4xl">
                            {searchMode === 'PHONE' && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Tìm kiếm điện thoại trong kho</label>
                                    <PhoneSearchSelect onSelect={handlePhoneSelect} hasSalePrice={false} label="" />
                                    <p className="mt-1 text-xs text-slate-400">*Gõ IMEI, tên máy hoặc màu sắc...</p>
                                </div>
                            )}
                            {searchMode === 'SALE' && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Tìm kiếm Hoá đơn bán máy</label>
                                    <WarrantyItemSearchSelect type="SALE" onSelect={handleWarrantySelect} />
                                    <p className="mt-1 text-xs text-slate-400">*Gõ mã hóa đơn, tên khách hàng hoặc số điện thoại...</p>
                                </div>
                            )}
                            {searchMode === 'REPAIR' && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Tìm kiếm Phiếu sửa chữa</label>
                                    <WarrantyItemSearchSelect type="REPAIR" onSelect={handleWarrantySelect} />
                                    <p className="mt-1 text-xs text-slate-400">*Gõ mã phiếu, tên khách hàng hoặc SĐT khách sửa máy...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- THAO TÁC NHANH (QUICK ACTIONS) GIỮ NGUYÊN --- */}
                    <section className="flex flex-col gap-4">
                        <h3 className="text-lg font-bold leading-tight text-[#0f172a]">Thao tác nhanh</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Link href="/dashboard/import" className="group flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                                <div className="rounded-full bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-white"><Download className="h-7 w-7" /></div>
                                <div className="flex flex-col gap-1"><h2 className="text-base font-bold leading-tight text-[#0f172a]">Nhập máy</h2><p className="text-sm font-normal leading-normal text-muted">Nhập máy mới vào hệ thống</p></div>
                            </Link>
                            <Link href="/dashboard/sales" className="group flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                                <div className="rounded-full bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-white"><Smartphone className="h-7 w-7" /></div>
                                <div className="flex flex-col gap-1"><h2 className="text-base font-bold leading-tight text-[#0f172a]">Bán máy</h2><p className="text-sm font-normal leading-normal text-muted">Lập đơn bán máy cho khách</p></div>
                            </Link>
                            <Link href="/dashboard/repairs" className="group flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                                <div className="rounded-full bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-white"><Wrench className="h-7 w-7" /></div>
                                <div className="flex flex-col gap-1"><h2 className="text-base font-bold leading-tight text-[#0f172a]">Sửa máy</h2><p className="text-sm font-normal leading-normal text-muted">Quản lý máy sửa chữa</p></div>
                            </Link>
                            <Link href="/dashboard/warranties" className="group flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                                <div className="rounded-full bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-white"><ShieldCheck className="h-7 w-7" /></div>
                                <div className="flex flex-col gap-1"><h2 className="text-base font-bold leading-tight text-[#0f172a]">Bảo hành</h2><p className="text-sm font-normal leading-normal text-muted">Tra cứu phiếu bảo hành</p></div>
                            </Link>
                        </div>
                    </section>

                    {/* --- HIỆU SUẤT KINH DOANH (ĐÃ UPDATE DỮ LIỆU THẬT) --- */}
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold leading-tight text-[#0f172a]">
                                Hiệu suất kinh doanh
                            </h3>
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
                                            {formatCurrency(invoiceStats.totalRevenue || 0)}
                                        </p>
                                    </div>
                                    <span className="rounded-lg bg-slate-100 p-2 text-slate-500">
                                        <Smartphone className="h-6 w-6" />
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center rounded bg-[#078838]/10 px-2 py-0.5 text-xs font-bold text-[#078838]">
                                        Hôm nay
                                    </span>
                                    <p className="text-xs font-medium leading-normal text-muted">
                                        Cập nhật tự động
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
                                            {repairStats.completedTodayCount || 0}
                                        </p>
                                    </div>
                                    <span className="rounded-lg bg-slate-100 p-2 text-slate-500">
                                        <Home className="h-6 w-6" />
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center rounded bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-600">
                                        Hoàn thành
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
                                            {saleStats.todayCount || 0} <span className="text-base font-normal text-slate-500">máy</span>
                                        </p>
                                    </div>
                                    <span className="rounded-lg bg-slate-100 p-2 text-slate-500">
                                        <ShoppingBag className="h-6 w-6" />
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-600">
                                        Hôm nay
                                    </span>
                                    <p className="text-xs font-medium leading-normal text-muted">
                                        Đã xuất kho
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