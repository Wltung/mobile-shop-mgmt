'use client'

import { useState } from 'react'
import { Plus, Search, Eye, Trash2, ShieldAlert, CheckCircle2, ShoppingCart, Wrench } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useWarrantyList } from '@/hooks/warranty/useWarrantyList'
import { Warranty } from '@/types/warranty'
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
import CreateWarrantyModal from '@/components/phones/warranties/CreateWarrantyModal'
import ConfirmModal from '@/components/common/ConfirmModal'

// import CreateWarrantyModal from '@/components/phones/warranties/CreateWarrantyModal'

export default function WarrantyListPage() {
    const router = useRouter()
    
    const {
        warranties,
        isLoading,
        stats,
        meta,
        filters,
        setKeyword,
        setStatus,
        setPage,
        setDateFilter,
        formatJustDate,
        refresh,
        deleteWarranty
    } = useWarrantyList()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [confirmDeleteItem, setConfirmDeleteItem] = useState<Warranty | null>(null)

    // --- 1. CẤU HÌNH STATS ---
    const statItems = [
        {
            label: 'TIẾP NHẬN HÔM NAY',
            value: `${stats?.receivedTodayCount || 0} máy`,
            icon: <ShieldAlert className="h-5 w-5" />,
            color: 'indigo' as const,
        },
        {
            label: 'ĐÃ TRẢ HÔM NAY',
            value: `${stats?.doneTodayCount || 0} máy`,
            icon: <CheckCircle2 className="h-5 w-5" />,
            color: 'emerald' as const,
        },
    ]

    // --- 2. CẤU HÌNH CỘT BẢNG ---
    const columns: ColumnDef<Warranty>[] = [
        {
            header: 'ĐỜI MÁY',
            accessorKey: 'device_name',
            cell: (item) => (
                <span className="font-bold text-slate-800">
                    {item.device_name || '---'}
                </span>
            ),
        },
        {
            header: 'KHÁCH HÀNG',
            accessorKey: 'customer_name',
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-slate-800">{item.customer_name || 'Khách vãng lai'}</span>
                    <span className="text-sm text-slate-500">{item.customer_phone || '---'}</span>
                </div>
            ),
        },
        {
            header: 'LỖI KHÁCH BÁO',
            className: 'max-w-[200px]',
            cell: (item) => {
                // ĐÃ FIX: CHỈ LẤY TỪ description_json. Tuyệt đối không fallback sang description nữa.
                const faultText = item.description_json?.fault || '---' 
                return (
                    <div 
                        className="text-sm font-medium text-slate-600 line-clamp-2" 
                        title={faultText}
                    >
                        {faultText}
                    </div>
                )
            },
        },
        {
            header: 'LOẠI BẢO HÀNH',
            accessorKey: 'phone_id',
            cell: (item) => {
                const isSale = !!item.phone_id
                return (
                    <div className={`flex items-center gap-1.5 text-sm font-medium ${isSale ? 'text-blue-600' : 'text-orange-600'}`}>
                        {isSale ? <ShoppingCart className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
                        <span>{isSale ? 'Bán máy' : 'Sửa chữa'}</span>
                    </div>
                )
            },
        },
        {
            header: 'NGÀY TIẾP NHẬN',
            accessorKey: 'created_at',
            cell: (item) => (
                <span className="whitespace-nowrap font-medium text-slate-700">
                    {formatJustDate(item.created_at)}
                </span>
            ),
        },
        {
            header: 'TRẠNG THÁI',
            accessorKey: 'status',
            className: 'text-center',
            cell: (item) => {
                const config: Record<string, { label: string, color: string }> = {
                    RECEIVED: { label: 'Đã tiếp nhận', color: 'bg-slate-100 text-slate-700' },
                    PROCESSING: { label: 'Đang xử lý', color: 'bg-amber-100 text-amber-700' },
                    DONE: { label: 'Đã trả máy', color: 'bg-green-100 text-green-700' },
                    CANCELLED: { label: 'Từ chối', color: 'bg-red-100 text-red-700' },
                }
                const st = config[item.status] || config.RECEIVED
                return (
                    <div className="flex justify-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${st.color}`}>
                            {st.label}
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
                        onClick={() => router.push(`/dashboard/warranties/${item.id}`)}
                        title="Xem chi tiết"
                    >
                        <Eye className="h-5 w-5" />
                    </button>
                    <button 
                        className="rounded p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Xóa phiếu"
                        onClick={() => setConfirmDeleteItem(item)}
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            ),
        },
    ]

    // --- 3. CẤU HÌNH THANH CÔNG CỤ ---
    const Toolbar = (
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="relative w-full md:max-w-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Search className="h-5 w-5" />
                </div>
                <Input
                    placeholder="Tìm kiếm đời máy, tên khách, SĐT..."
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
                            <SelectItem value="RECEIVED">Đã tiếp nhận</SelectItem>
                            <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                            <SelectItem value="DONE">Đã trả máy</SelectItem>
                            <SelectItem value="CANCELLED">Từ chối</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )

    return (
        <div className="flex h-full flex-col bg-[#f8fafc]">
            <DashboardHeader title="Quản lý Bảo hành" />

            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
                    {/* TOP ACTION SECTION */}
                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <StatsCards stats={statItems} />

                        <PageActionButton
                            label="Tạo phiếu bảo hành"
                            icon={<Plus className="h-5 w-5" />}
                            onClick={() => setIsModalOpen(true)}
                        />
                    </div>

                    {/* TABLE SECTION */}
                    <section className="flex flex-col gap-4">
                        <h3 className="text-lg font-bold leading-tight text-[#0f172a]">
                            Danh sách Bảo hành
                        </h3>

                        <DataTable
                            data={warranties}
                            columns={columns}
                            isLoading={isLoading}
                            meta={meta}
                            onPageChange={setPage}
                            toolbar={Toolbar}
                        />
                    </section>
                </div>
            </div>

            <CreateWarrantyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => refresh()}
            />

            {/* MODAL XÁC NHẬN XOÁ */}
            <ConfirmModal
                isOpen={!!confirmDeleteItem}
                onClose={() => setConfirmDeleteItem(null)}
                onConfirm={() => {
                    if (confirmDeleteItem) {
                        deleteWarranty(confirmDeleteItem.id)
                        setConfirmDeleteItem(null)
                    }
                }}
                title="Xác nhận xoá phiếu bảo hành?"
                description={
                    confirmDeleteItem?.status === 'RECEIVED'
                        ? <>Phiếu này mới được tiếp nhận và chưa xử lý. Dữ liệu sẽ bị <strong className="text-red-600">xoá vĩnh viễn</strong>.</>
                        : <>Phiếu này đã được xử lý. Lịch sử của phiếu sẽ được <strong className="text-slate-700">ẩn khỏi danh sách</strong> để đảm bảo an toàn dữ liệu.</>
                }
                confirmText="Xác nhận xoá"
                variant="danger"
            />
        </div>
    )
}