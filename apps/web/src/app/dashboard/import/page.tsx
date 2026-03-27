'use client'

import { useState } from 'react'
import { Plus, Search, Eye, Trash2, Package, DollarSign } from 'lucide-react'
import { usePhoneList } from '@/hooks/phone/usePhoneList'
import { Phone } from '@/types/phone'
import { ColumnDef } from '@/types/common'
import { useRouter } from 'next/navigation'

// Import Generic Components
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import StatsCards from '@/components/common/StatsCards'
import { DataTable } from '@/components/common/DataTable'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import ImportPhoneModal from '@/components/phones/import/ImportPhoneModal'
import PageActionButton from '@/components/common/PageActionButton'

export default function ImportPage() {
    const router = useRouter()
    const {
        phones,
        isLoading,
        stats,
        meta,
        filters,
        setKeyword,
        setStatus,
        setPage,
        setDateFilter,
        formatCurrency,
        formatJustDate,
        refresh,
    } = usePhoneList('IMPORT')

    const [isModalOpen, setIsModalOpen] = useState(false)

    // --- 1. CẤU HÌNH STATS ---
    const statItems = [
        {
            label: 'Tổng máy đang có trong kho',
            // Lấy từ cục stats API trả về
            value: `${stats?.inventoryCount || 0} máy`,
            icon: <Package className="h-5 w-5 text-blue-600" />,
            color: 'blue' as const,
        },
        {
            label: 'Tổng giá trị tồn kho',
            // Lấy từ cục stats API trả về
            value: formatCurrency(stats?.inventoryValue || 0),
            icon: <DollarSign className="h-5 w-5 text-green-600" />,
            color: 'green' as const,
        },
    ]

    // --- 2. CẤU HÌNH CỘT BẢNG (COLUMNS) ---
    const columns: ColumnDef<Phone>[] = [
        {
            header: 'NGÀY NHẬP',
            accessorKey: 'purchase_date',
            cell: (item) => (
                <span className="whitespace-nowrap">
                    {formatJustDate(item.purchase_date)}
                </span>
            ),
        },
        {
            header: 'ĐỜI MÁY',
            accessorKey: 'model_name',
            cell: (item) => {
                // ĐÃ FIX: Xử lý hiển thị RAM / ROM
                const ram = item.details?.ram || ''
                const storage = item.details?.storage || ''
                const memoryInfo = [ram, storage].filter(Boolean).join(' / ')
                const displayName = memoryInfo 
                    ? `${item.model_name} (${memoryInfo})` 
                    : item.model_name

                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900">
                            {displayName}
                        </span>
                        <span className="font-mono text-xs text-slate-500">
                            IMEI: {item.imei}
                        </span>
                    </div>
                )
            },
        },
        {
            header: 'GIÁ NHẬP',
            accessorKey: 'purchase_price',
            cell: (item) => (
                <span className="font-bold text-slate-700">
                    {formatCurrency(item.purchase_price)}
                </span>
            ),
        },
        {
            header: 'GIÁ BÁN',
            accessorKey: 'sale_price',
            cell: (item) => (
                <span
                    className={
                        item.sale_price == null
                            ? 'ml-5 font-extrabold text-slate-800'
                            : 'font-bold text-slate-700'
                    }
                >
                    {item.sale_price != null
                        ? formatCurrency(item.sale_price)
                        : '-'}
                </span>
            ),
        },
        {
            header: 'TRẠNG THÁI MÁY',
            accessorKey: 'status',
            className: 'text-center',
            cell: (item) => {
                const styles: Record<string, string> = {
                    IN_STOCK: 'bg-green-100 text-green-800',
                    SOLD: 'bg-slate-100 text-slate-800',
                    REPAIRING: 'bg-yellow-100 text-yellow-800',
                }
                const labels: Record<string, string> = {
                    IN_STOCK: 'Trong kho',
                    SOLD: 'Đã bán',
                    REPAIRING: 'Đang sửa',
                }
                return (
                    <div className="flex justify-center">
                        <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[item.status]}`}
                        >
                            {labels[item.status] || item.status}
                        </span>
                    </div>
                )
            },
        },
        {
            header: 'HOÁ ĐƠN',
            accessorKey: 'invoice_status',
            className: 'text-center',
            cell: (item) => {
                const status = item.invoice_status || 'DRAFT'
                const config = {
                    PAID: {
                        label: 'Đã chốt',
                        class: 'bg-blue-100 text-blue-700',
                    },
                    DRAFT: {
                        label: 'Lưu nháp',
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
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${current.class}`}>
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
                        className="rounded p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary"
                        onClick={() =>
                            router.push(`/dashboard/phones/${item.id}`)
                        }
                        title="Xem chi tiết"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button className="rounded p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ]

    // --- 3. CẤU HÌNH THANH CÔNG CỤ (TOOLBAR) ---
    const Toolbar = (
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="relative w-full md:max-w-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Search className="h-5 w-5" />
                </div>
                <Input
                    placeholder="Tìm kiếm theo mã IMEI, Tên máy..."
                    className="h-10 border-slate-300 pl-10 focus-visible:ring-primary"
                    value={filters.keyword || ''}
                    onChange={(e) => setKeyword(e.target.value)}
                />
            </div>
            <div className="flex w-full gap-3 md:w-auto">
                <div className="relative min-w-[160px] flex-1 md:flex-none">
                    <Select onValueChange={setDateFilter} defaultValue="all">
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
                <div className="relative min-w-[160px] flex-1 md:flex-none">
                    <Select
                        onValueChange={setStatus}
                        value={filters.status || 'ALL'}
                    >
                        <SelectTrigger className="h-10 border-slate-300">
                            <SelectValue placeholder="Tất cả trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">
                                Tất cả trạng thái
                            </SelectItem>
                            <SelectItem value="IN_STOCK">Trong kho</SelectItem>
                            <SelectItem value="SOLD">Đã bán</SelectItem>
                            <SelectItem value="REPAIRING">Đang sửa</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )

    return (
        <div className="flex h-full flex-col bg-[#f8fafc]">
            <DashboardHeader title="Quản lý Nhập máy" />

            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
                    {/* TOP ACTION SECTION */}
                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <StatsCards stats={statItems} />

                        {/* --- SỬ DỤNG COMPONENT CHUNG --- */}
                        <PageActionButton
                            label="Nhập máy mới"
                            icon={<Plus className="h-5 w-5" />}
                            onClick={() => setIsModalOpen(true)}
                        />
                    </div>

                    {/* TABLE SECTION */}
                    <section className="flex flex-col gap-4">
                        <h3 className="text-lg font-bold leading-tight text-[#0f172a]">
                            Lịch sử Nhập máy
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

            <ImportPhoneModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => refresh()}
            />
        </div>
    )
}
