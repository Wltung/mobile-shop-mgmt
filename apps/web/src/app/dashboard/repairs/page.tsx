'use client'

import { useState } from 'react'
import { Plus, Search, Eye, Trash2, Wrench, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Giả định bạn sẽ tạo hook này tương tự usePhoneList
import { useRepairList } from '@/hooks/repair/useRepairList' 
import { Repair } from '@/types/repair'
import { ColumnDef } from '@/types/common'

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
import PageActionButton from '@/components/common/PageActionButton'

// Chú ý: Component CreateRepairModal sẽ được tạo ở bước sau
// import CreateRepairModal from '@/components/repairs/CreateRepairModal'

export default function RepairListPage() {
    const router = useRouter()
    
    // Gọi custom hook (API) - Các state và function y hệt usePhoneList
    const {
        repairs,
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
    } = useRepairList()

    const [isModalOpen, setIsModalOpen] = useState(false)

    // --- 1. CẤU HÌNH STATS (Khớp với hình thiết kế) ---
    const statItems = [
        {
            label: 'Máy đang sửa',
            value: `${stats?.repairingCount || 0} máy`,
            icon: <Wrench className="h-5 w-5" />,
            color: 'blue' as const,
        },
        {
            label: 'Hoàn thành hôm nay',
            value: `${stats?.completedTodayCount || 0} máy`,
            icon: <CheckCircle2 className="h-5 w-5" />,
            color: 'green' as const,
        },
    ]

    // --- 2. CẤU HÌNH CỘT BẢNG (COLUMNS) ---
    const columns: ColumnDef<Repair>[] = [
        {
            header: 'NGÀY NHẬN',
            accessorKey: 'created_at',
            cell: (item) => (
                <span className="whitespace-nowrap font-medium text-slate-500">
                    {formatJustDate(item.created_at)}
                </span>
            ),
        },
        {
            header: 'KHÁCH HÀNG',
            accessorKey: 'customer_name',
            cell: (item) => (
                <span className="font-bold text-slate-900">
                    {item.customer_name || 'Khách lẻ'}
                </span>
            ),
        },
        {
            header: 'ĐỜI MÁY',
            accessorKey: 'device_name',
            cell: (item) => (
                <span className="font-semibold text-slate-700">
                    {item.device_name || '---'}
                </span>
            ),
        },
        {
            header: 'GIÁ SỬA',
            accessorKey: 'repair_price',
            className: 'text-right', // Căn phải cho cột tiền tệ
            cell: (item) => {
                // Tính tổng tiền linh kiện và tiền công
                const partCost = item.part_cost || 0
                const repairPrice = item.repair_price || 0
                const total = partCost + repairPrice

                return (
                    <span className="flex justify-end font-bold text-slate-700">
                        {total > 0 ? formatCurrency(total) : '---'}
                    </span>
                )
            },
        },
        {
            header: 'TRẠNG THÁI',
            accessorKey: 'status',
            className: 'text-center',
            cell: (item) => {
                // Map màu sắc badge khớp với hình ảnh thiết kế
                const styles: Record<string, string> = {
                    PENDING: 'bg-slate-100 text-slate-700',
                    REPAIRING: 'bg-yellow-100 text-yellow-700',
                    WAITING_CUSTOMER: 'bg-blue-100 text-blue-700',
                    COMPLETED: 'bg-green-100 text-green-700',
                    DELIVERED: 'bg-emerald-100 text-emerald-800',
                }
                const labels: Record<string, string> = {
                    PENDING: 'Chờ kiểm tra',
                    REPAIRING: 'Đang sửa',
                    WAITING_CUSTOMER: 'Chờ khách',
                    COMPLETED: 'Hoàn thành',
                    DELIVERED: 'Đã giao',
                }
                return (
                    <div className="flex justify-center">
                        <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles[item.status] || styles.PENDING}`}
                        >
                            {labels[item.status] || item.status}
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
                        onClick={() =>
                            router.push(`/dashboard/repairs/${item.id}`)
                        }
                        title="Xem chi tiết"
                    >
                        <Eye className="h-5 w-5" />
                    </button>
                    <button 
                        className="rounded p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Xóa phiếu"
                    >
                        <Trash2 className="h-5 w-5" />
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
                    placeholder="Tìm kiếm theo IMEI, Tên khách..."
                    className="h-10 border-slate-300 pl-10 focus-visible:ring-primary bg-slate-50/50"
                    value={filters.keyword || ''}
                    onChange={(e) => setKeyword(e.target.value)}
                />
            </div>
            <div className="flex w-full gap-3 md:w-auto">
                <div className="relative min-w-[160px] flex-1 md:flex-none">
                    <Select onValueChange={setDateFilter} defaultValue="all">
                        <SelectTrigger className="h-10 border-slate-300 font-medium text-slate-600">
                            <SelectValue placeholder="Tất cả thời gian" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả thời gian</SelectItem>
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
                        <SelectTrigger className="h-10 border-slate-300 font-medium text-slate-600">
                            <SelectValue placeholder="Tất cả trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                            <SelectItem value="PENDING">Chờ kiểm tra</SelectItem>
                            <SelectItem value="REPAIRING">Đang sửa</SelectItem>
                            <SelectItem value="WAITING_CUSTOMER">Chờ khách</SelectItem>
                            <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )

    return (
        <div className="flex h-full flex-col bg-[#f8fafc]">
            <DashboardHeader title="Quản lý Sửa chữa" />

            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
                    {/* TOP ACTION SECTION */}
                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <StatsCards stats={statItems} />

                        <PageActionButton
                            label="Tiếp nhận máy sửa"
                            icon={<Plus className="h-5 w-5" />}
                            onClick={() => setIsModalOpen(true)}
                        />
                    </div>

                    {/* TABLE SECTION */}
                    <section className="flex flex-col gap-4">
                        <h3 className="text-lg font-bold leading-tight text-[#0f172a]">
                            Lịch sử Sửa chữa
                        </h3>

                        <DataTable
                            data={repairs}
                            columns={columns}
                            isLoading={isLoading}
                            meta={meta}
                            onPageChange={setPage}
                            toolbar={Toolbar}
                        />
                    </section>
                </div>
            </div>

            {/* Component Modal tạo mới sẽ được gọi ở đây */}
            {/* <CreateRepairModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => refresh()}
            /> */}
        </div>
    )
}