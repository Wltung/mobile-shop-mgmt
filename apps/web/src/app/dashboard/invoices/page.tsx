'use client'

import { useRouter } from 'next/navigation'
import { Search, Eye, Printer, Banknote, ReceiptText } from 'lucide-react'

import { useInvoiceList } from '@/hooks/invoice/useInvoiceList'
import { Invoice } from '@/types/invoice'
import { ColumnDef } from '@/types/common'
import { formatCurrency, formatJustDate } from '@/lib/utils'

import DashboardHeader from '@/components/dashboard/DashboardHeader'
import StatsCards from '@/components/common/StatsCards'
import { DataTable } from '@/components/common/DataTable'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function InvoiceListPage() {
    const router = useRouter()
    
    // ĐÃ FIX: Lôi thêm setType ra từ hook
    const {
        invoices, isLoading, meta, stats, filters,
        setKeyword, setStatus, setType, setPage, setDateFilter
    } = useInvoiceList()

    const statItems = [
        {
            label: 'TỔNG DOANH THU HOÁ ĐƠN TRONG NGÀY',
            value: formatCurrency(stats?.totalRevenue || 0),
            icon: <Banknote className="h-6 w-6 text-blue-600" />,
            color: 'blue' as const,
        },
        {
            label: 'SỐ LƯỢNG HOÁ ĐƠN TRONG NGÀY',
            value: `${stats?.totalCount || 0} hoá đơn`,
            icon: <ReceiptText className="h-6 w-6 text-indigo-600" />,
            color: 'indigo' as const,
        },
    ]

    const columns: ColumnDef<Invoice>[] = [
        // ĐÃ FIX: BỔ SUNG CỘT MÃ HOÁ ĐƠN LÊN ĐẦU
        {
            header: 'MÃ HOÁ ĐƠN',
            accessorKey: 'invoice_code',
            cell: (item) => (
                <span className="font-mono font-bold text-blue-600">
                    {item.invoice_code || `#HD-${item.id}`}
                </span>
            ),
        },
        {
            header: 'NGÀY TẠO',
            accessorKey: 'created_at',
            cell: (item) => (
                <span className="font-medium text-slate-700">
                    {formatJustDate(item.created_at)}
                </span>
            ),
        },
        {
            header: 'LOẠI HOÁ ĐƠN',
            accessorKey: 'type',
            cell: (item) => {
                const typeConfig: Record<string, { label: string, class: string }> = {
                    SALE: { label: 'Bán máy', class: 'text-blue-600 bg-blue-50 border border-blue-100' },
                    REPAIR: { label: 'Sửa chữa', class: 'text-fuchsia-600 bg-fuchsia-50 border border-fuchsia-100' },
                    IMPORT: { label: 'Nhập máy', class: 'text-orange-600 bg-orange-50 border border-orange-100' },
                }
                const current = typeConfig[item.type] || typeConfig.SALE
                return (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${current.class}`}>
                        {current.label}
                    </span>
                )
            },
        },
        {
            header: 'KHÁCH HÀNG',
            accessorKey: 'customer_name',
            cell: (item) => (
                <span className="font-semibold text-slate-800">
                    {item.type === 'IMPORT' ? 'Đối tác nhập hàng' : (item.customer_name || 'Khách vãng lai')}
                </span>
            ),
        },
        {
            header: 'TỔNG TIỀN',
            accessorKey: 'total_amount',
            cell: (item) => (
                <span className="font-bold text-slate-900">
                    {formatCurrency(item.total_amount)}
                </span>
            ),
        },
        {
            header: 'TRẠNG THÁI',
            accessorKey: 'status',
            className: 'text-center',
            cell: (item) => {
                const status = item.status || 'DRAFT'
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
                const current = config[status as keyof typeof config] || config.DRAFT

                return (
                    <div className="flex justify-center">
                        <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${current.class}`}>
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
                        className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600"
                        onClick={() => router.push(`/dashboard/invoices/${item.id}`)}
                        title="Xem chi tiết"
                    >
                        <Eye className="h-5 w-5" />
                    </button>
                    <button 
                        className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        title="In hoá đơn"
                    >
                        <Printer className="h-5 w-5" />
                    </button>
                </div>
            ),
        },
    ]

    const Toolbar = (
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="relative w-full md:max-w-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Search className="h-5 w-5" />
                </div>
                <Input
                    placeholder="Tìm kiếm mã hoá đơn, tên khách hàng..."
                    className="h-10 border-slate-300 pl-10 focus-visible:ring-primary bg-slate-50/50"
                    value={filters.keyword || ''}
                    onChange={(e) => setKeyword(e.target.value)}
                />
            </div>
            
            {/* ĐÃ FIX: Flex-wrap để các select rớt dòng mượt mà trên mobile */}
            <div className="flex w-full flex-wrap gap-3 md:w-auto md:flex-nowrap">
                <div className="relative min-w-[150px] flex-1 md:flex-none">
                    <Select onValueChange={setDateFilter} defaultValue="all">
                        <SelectTrigger className="h-10 border-slate-300 font-medium text-slate-600">
                            <SelectValue placeholder="Khoảng ngày" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả thời gian</SelectItem>
                            <SelectItem value="today">Hôm nay</SelectItem>
                            <SelectItem value="week">Tuần này</SelectItem>
                            <SelectItem value="month">Tháng này</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* ĐÃ FIX: THÊM BỘ LỌC LOẠI HOÁ ĐƠN */}
                <div className="relative min-w-[150px] flex-1 md:flex-none">
                    <Select onValueChange={setType} value={filters.type || 'ALL'}>
                        <SelectTrigger className="h-10 border-slate-300 font-medium text-slate-600">
                            <SelectValue placeholder="Loại hoá đơn" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Loại: Tất cả</SelectItem>
                            <SelectItem value="SALE">Bán máy</SelectItem>
                            <SelectItem value="REPAIR">Sửa chữa</SelectItem>
                            <SelectItem value="IMPORT">Nhập hàng</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="relative min-w-[170px] flex-1 md:flex-none">
                    <Select onValueChange={setStatus} value={filters.status || 'ALL'}>
                        <SelectTrigger className="h-10 border-slate-300 font-medium text-slate-600">
                            <SelectValue placeholder="Trạng thái: Tất cả" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Trạng thái: Tất cả</SelectItem>
                            <SelectItem value="PAID">Đã hoàn thành</SelectItem>
                            <SelectItem value="DRAFT">Chưa hoàn thành</SelectItem>
                            <SelectItem value="CANCELLED">Đã huỷ</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )

    return (
        <div className="flex h-full flex-col bg-[#f8fafc]">
            <DashboardHeader title="Quản lý Hoá đơn" />

            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
                    <div className="w-full">
                        <StatsCards stats={statItems} />
                    </div>

                    <section className="flex flex-col gap-4">
                        <DataTable
                            data={invoices}
                            columns={columns}
                            isLoading={isLoading}
                            meta={meta}
                            onPageChange={setPage}
                            toolbar={Toolbar}
                        />
                    </section>
                </div>
            </div>
        </div>
    )
}