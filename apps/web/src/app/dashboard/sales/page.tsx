'use client'

import { useState } from 'react'
import {
    Plus,
    Search,
    Eye,
    Trash2,
    ShoppingCart,
    DollarSign,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// Hooks & Types
import { usePhoneList } from '@/hooks/phone/usePhoneList'
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
import ConfirmModal from '@/components/common/ConfirmModal'

export default function SalesPage() {
    const router = useRouter()

    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false)
    const [deleteItem, setDeleteItem] = useState<Phone | null>(null)
    const [warningItem, setWarningItem] = useState<Phone | null>(null)

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
        formatJustDate,
        setStatus,
        refresh,
        deletePhone
    } = usePhoneList('SALE')

    // --- CẤU HÌNH STATS (Khác trang Import) ---
    const statItems = [
        {
            label: 'SỐ MÁY BÁN TRONG NGÀY',
            // Sử dụng dữ liệu mới từ backend
            value: `${stats?.todayCount || 0} máy`, 
            icon: <ShoppingCart className="h-6 w-6 text-blue-600" />,
            color: 'blue' as const,
        },
        {
            label: 'DOANH THU TRONG NGÀY',
            // Sử dụng dữ liệu mới từ backend
            value: formatCurrency(stats?.todayRevenue || 0), 
            icon: <DollarSign className="h-6 w-6 text-emerald-600" />,
            color: 'emerald' as const,
        },
    ]

    // --- CẤU HÌNH CỘT BẢNG (Custom cho trang Bán) ---
    const columns: ColumnDef<Phone>[] = [
        {
            header: 'NGÀY BÁN',
            accessorKey: 'sale_date',
            cell: (item) => (
                <span className="whitespace-nowrap text-slate-600">
                    {item.sale_date ? formatJustDate(item.sale_date) : '---'}
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
                    {item.invoice_status !== 'CANCELLED' && (
                        <button 
                            className="rounded p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                            onClick={() => {
                                if (item.invoice_status === 'PAID') {
                                    setWarningItem(item) // Đã thanh toán -> Bật cảnh báo vàng
                                } else {
                                    setDeleteItem(item)  // Lưu nháp -> Bật xoá đỏ
                                }
                            }}
                            title={item.invoice_status === 'PAID' ? "Huỷ hoá đơn này" : "Xoá bản nháp"}
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
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

            {/* MODAL ĐỎ: XOÁ HOÁ ĐƠN NHÁP */}
            <ConfirmModal
                isOpen={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={() => {
                    if (deleteItem && deleteItem.invoice_id) {
                        deletePhone(deleteItem.id, deleteItem.invoice_id)
                        setDeleteItem(null)
                    }
                }}
                title="Xác nhận xoá bản nháp?"
                description={
                    <>
                        Bạn có chắc chắn muốn xoá phiếu bán này? <br />
                        Máy <span className="font-bold text-slate-700">{deleteItem?.model_name}</span> sẽ được tự động hoàn trả lại kho.
                    </>
                }
                confirmText="Xác nhận xoá"
                variant="danger"
            />

            {/* MODAL VÀNG: CẢNH BÁO MÁY ĐÃ CÓ HOÁ ĐƠN PAID */}
            <ConfirmModal
                isOpen={!!warningItem}
                onClose={() => setWarningItem(null)}
                onConfirm={() => {
                    if (warningItem?.invoice_id) {
                        router.push(`/dashboard/invoices/${warningItem.invoice_id}`)
                    } else {
                        router.push(`/dashboard/invoices`)
                    }
                    setWarningItem(null)
                }}
                title="Không thể xoá trực tiếp!"
                description={
                    <>
                        Máy này đã được thanh toán trong hoá đơn xuất <span className="font-bold text-slate-700">{warningItem?.invoice_code || 'Bán'}</span>. 
                        <br /><br />
                        Để hoàn trả máy lại kho, vui lòng chuyển đến chi tiết hoá đơn và thực hiện thao tác <span className="font-bold text-red-600">Huỷ hoá đơn</span>.
                    </>
                }
                confirmText="Xem hoá đơn"
                cancelText="Đã hiểu"
                variant="warning"
            />
        </div>
    )
}
