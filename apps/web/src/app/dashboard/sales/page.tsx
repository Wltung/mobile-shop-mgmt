'use client'

import { useState, useEffect } from 'react'
import {
    Plus,
    Search,
    Eye,
    Trash2,
    ShoppingCart,
    DollarSign,
    Calendar,
    FileText,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// Hooks & Types
import { usePhoneList } from '@/hooks/usePhoneList'
import { Phone } from '@/types/phone'
import { ColumnDef } from '@/types/common'

// Components
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import StatsCards from '@/components/common/StatsCards'
import { DataTable } from '@/components/common/DataTable'
import PageActionButton from '@/components/common/PageActionButton'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import SalePhoneModal from '@/components/phones/sales/SalePhoneModal'

export default function SalesPage() {
    const router = useRouter()

    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false)

    // Sử dụng hook list nhưng set logic riêng cho trang Sales
    const {
        phones,
        isLoading,
        stats,
        meta,
        filters,
        setKeyword,
        setPage,
        setDateFilter,
        formatCurrency,
        formatDate,
        setStatus,
        refresh,
    } = usePhoneList('SALE')

    // --- CẤU HÌNH STATS (Khác trang Import) ---
    const statItems = [
        {
            label: 'Số máy bán hôm nay',
            // Lưu ý: Logic tính "Hôm nay" cần BE hỗ trợ hoặc filter list client
            // Tạm thời hiển thị tổng số máy đã bán (dựa trên filter SOLD)
            value: `${stats.totalPhones} máy`,
            icon: <ShoppingCart className="h-5 w-5" />,
            color: 'blue' as const,
        },
        {
            label: 'Doanh thu', // Hiển thị tổng giá trị bán
            value: formatCurrency(stats.totalValue),
            icon: <DollarSign className="h-5 w-5" />,
            color: 'green' as const,
        },
    ]

    // --- CẤU HÌNH CỘT BẢNG (Custom cho trang Bán) ---
    const columns: ColumnDef<Phone>[] = [
        {
            header: 'NGÀY BÁN',
            accessorKey: 'sale_date',
            cell: (item) => (
                <span className="whitespace-nowrap text-slate-600">
                    {item.sale_date ? formatDate(item.sale_date) : '---'}
                </span>
            ),
        },
        {
            header: 'ĐỜI MÁY',
            accessorKey: 'model_name',
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900">
                        {item.model_name}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                        {item.imei}
                    </span>
                </div>
            ),
        },
        {
            header: 'KHÁCH HÀNG',
            accessorKey: 'buyer_name',
            cell: (item) => (
                <span className="font-medium text-slate-700">
                    {item.buyer_name || 'Khách lẻ'}
                </span>
            ),
        },
        {
            header: 'GIÁ BÁN',
            accessorKey: 'sale_price',
            cell: (item) => (
                <span className="font-bold text-slate-900">
                    {item.sale_price ? formatCurrency(item.sale_price) : '0 đ'}
                </span>
            ),
        },
        {
            header: 'TRẠNG THÁI',
            accessorKey: 'invoice_status',
            className: 'text-center',
            cell: (item) => {
                // Logic hiển thị Paid/Draft
                const status = item.invoice_status || 'DRAFT'
                const config = {
                    PAID: {
                        label: 'Đã hoàn thành',
                        class: 'bg-green-100 text-green-700',
                    },
                    DRAFT: {
                        label: 'Chưa hoàn thành',
                        class: 'bg-amber-100 text-amber-700',
                    },
                    CANCELLED: {
                        label: 'Đã huỷ',
                        class: 'bg-red-100 text-red-700',
                    },
                }
                const current =
                    config[status as keyof typeof config] || config.DRAFT

                return (
                    <div className="flex justify-center">
                        <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${current.class}`}
                        >
                            {current.label}
                        </span>
                    </div>
                )
            },
        },
        {
            header: 'THAO TÁC',
            className: 'text-center',
            cell: (item) => (
                <div className="flex items-center justify-center gap-2">
                    <button
                        className="rounded p-2 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => {
                            if (item.invoice_id) {
                                router.push(
                                    `/dashboard/sales/${item.invoice_id}`,
                                )
                            }
                        }}
                        title="Xem chi tiết"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    {/* Nút xoá hoá đơn bán (nếu cần) */}
                    <button className="rounded p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ]

    // --- TOOLBAR ---
    const Toolbar = (
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="relative w-full md:max-w-md">
                {/* Search Input giữ nguyên */}
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Search className="h-5 w-5" />
                </div>
                <Input
                    placeholder="Tìm theo máy hoặc khách hàng..."
                    className="h-10 border-slate-300 pl-10 focus-visible:ring-primary"
                    value={filters.keyword || ''}
                    onChange={(e) => setKeyword(e.target.value)}
                />
            </div>

            <div className="flex w-full gap-3 md:w-auto">
                <div className="relative min-w-[160px] flex-1 md:flex-none">
                    <Select onValueChange={setDateFilter} defaultValue="all">
                        {/* Date Select giữ nguyên */}
                        <SelectTrigger className="h-10 border-slate-300">
                            <SelectValue placeholder="Thời gian" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                Tất cả thời gian
                            </SelectItem>
                            <SelectItem value="today">Hôm nay</SelectItem>
                            <SelectItem value="week">Tuần này</SelectItem>
                            <SelectItem value="month">Tháng này</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* [THÊM] Dropdown Lọc Trạng Thái Thanh Toán */}
                <div className="relative min-w-[180px] flex-1 md:flex-none">
                    <Select
                        onValueChange={setStatus} // Gọi hàm setStatus của hook
                        value={filters.status || 'ALL'}
                    >
                        <SelectTrigger className="h-10 border-slate-300">
                            <SelectValue placeholder="Trạng thái đơn" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">
                                Tất cả trạng thái
                            </SelectItem>
                            <SelectItem value="PAID">Đã hoàn thành</SelectItem>
                            <SelectItem value="DRAFT">
                                Chưa hoàn thành
                            </SelectItem>
                            <SelectItem value="CANCELLED">Đã huỷ</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )

    return (
        <div className="flex h-full flex-col bg-[#f8fafc]">
            <DashboardHeader title="Quản lý Bán máy" />

            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
                    {/* SECTION: THỐNG KÊ & ACTION */}
                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <StatsCards stats={statItems} />

                        <PageActionButton
                            label="Lập hoá đơn bán"
                            icon={<Plus className="h-5 w-5" />}
                            // Logic tạo hoá đơn bán sẽ làm sau (thường là chuyển sang trang POS bán hàng)
                            onClick={() => setIsSaleModalOpen(true)} // Mở modal
                        />
                    </div>

                    {/* SECTION: BẢNG DỮ LIỆU */}
                    <section className="flex flex-col gap-4">
                        <h3 className="text-lg font-bold leading-tight text-[#0f172a]">
                            Lịch sử Bán máy
                        </h3>

                        <DataTable
                            data={phones}
                            columns={columns}
                            isLoading={isLoading}
                            meta={meta}
                            onPageChange={setPage}
                            toolbar={Toolbar}
                        />
                    </section>
                </div>
            </div>

            {/* Component Modal Bán Hàng */}
            <SalePhoneModal
                isOpen={isSaleModalOpen}
                onClose={() => setIsSaleModalOpen(false)}
                onSuccess={() => refresh()} // Refresh list sau khi bán xong
            />
        </div>
    )
}
