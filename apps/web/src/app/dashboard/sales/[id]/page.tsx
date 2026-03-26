'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link' // THÊM IMPORT NÀY
import {
    Printer,
    Edit,
    User,
    Smartphone,
    CreditCard,
    FileText,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    UnlockKeyhole,
} from 'lucide-react'

// Components UI & Utils
import { Button } from '@/components/ui/button'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import PageBreadcrumb from '@/components/common/PageBreadcrumb'
import DetailCard from '@/components/common/detail/DetailCard'
import PageHeader from '@/components/common/detail/PageHeader'
import InvoiceStatusBadge from '@/components/common/badges/InvoiceStatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useInvoiceDetail } from '@/hooks/invoice/useInvoiceDetail'
import PageLoading from '@/components/common/PageLoading'
import EditSaleModal from '@/components/phones/sales/EditSaleModal'
import { useLockSale } from '@/hooks/invoice/useLockSaleInvoice'

// --- LOCAL COMPONENT: InfoBlock (Thay thế DetailRow để hiển thị dạng dọc) ---
const InfoBlock = ({
    label,
    value,
    className = '',
    valueClassName = 'text-base text-slate-900 font-medium',
}: {
    label: string
    value: React.ReactNode
    className?: string
    valueClassName?: string
}) => (
    <div className={`flex flex-col ${className}`}>
        <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
        </span>
        <div className={valueClassName}>{value || '---'}</div>
    </div>
)

export default function SaleDetailPage() {
    const { id } = useParams()
    // 1. Hook lấy dữ liệu
    const { invoice, isLoading, refresh } = useInvoiceDetail(Number(id))
    
    // UI State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    // 2. Hook Chốt đơn (Logic tách biệt)
    const { handleLockSale, isLocking } = useLockSale({
        invoice,
        onSuccess: refresh,
        onRequireUpdate: () => setIsEditModalOpen(true)
    })

    if (isLoading) return <PageLoading title="Chi tiết máy bán" />
    if (!invoice) return null

    // Lấy item điện thoại đầu tiên để hiển thị chi tiết
    const phoneItem = invoice.items?.find((i) => i.item_type === 'PHONE')
    let details: any = {}
    if (phoneItem?.phone_details) {
        details = typeof phoneItem.phone_details === 'string' 
            ? JSON.parse(phoneItem.phone_details) 
            : phoneItem.phone_details
    }

    const isDraft = invoice.status === 'DRAFT'
    const isPaid = invoice.status === 'PAID'
    
    // Kéo data thật từ BE đã làm ở bước trước
    const discountAmount = invoice.discount ?? 0
    // Giá gốc niêm yết = Giá khách thực trả (total_amount) + Tiền đã giảm
    const originalPrice = invoice.total_amount + discountAmount

    return (
        <div className="flex h-full flex-col bg-[#f8fafc]">
            <DashboardHeader title="Chi tiết máy bán" />

            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
                    {/* 1. BREADCRUMB */}
                    <PageBreadcrumb
                        items={[
                            { label: 'Trang chủ', href: '/dashboard' },
                            { label: 'Bán hàng', href: '/dashboard/sales' },
                            { label: 'Chi tiết máy bán' },
                        ]}
                    />

                    {/* 2. HEADER */}
                    <PageHeader
                        title={invoice.customer_name || 'Khách lẻ'}
                        status={<InvoiceStatusBadge status={invoice.status} />}
                        subtitle={
                            <div className="mt-1.5 flex items-center text-[15px] text-slate-500">
                                <span className="mr-1.5">Mã hoá đơn:</span>
                                {invoice.invoice_code || invoice.id ? (
                                    <Link
                                        href={`/dashboard/invoices/${invoice.id}`}
                                        className="rounded-md border border-slate-200 bg-white px-2.5 py-0.5 font-mono font-semibold text-slate-700 shadow-sm transition-all hover:border-blue-300 hover:text-blue-600"
                                        title="Xem hoá đơn gốc"
                                    >
                                        #{invoice.invoice_code || invoice.id}
                                    </Link>
                                ) : (
                                    <span className="font-mono font-semibold text-slate-700">---</span>
                                )}
                            </div>
                        }
                        actions={
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="gap-2 border-slate-300 bg-white text-slate-700 shadow-sm hover:border-primary hover:text-primary"
                                >
                                    <Edit className="h-4 w-4" />
                                    <span>Sửa thông tin</span>
                                </Button>
                                <Button 
                                    disabled={!isPaid}
                                    className={`gap-2 text-white shadow-md transition-all ${
                                        isPaid 
                                        ? 'bg-primary hover:bg-blue-600 shadow-primary/20' 
                                        : 'bg-slate-300 cursor-not-allowed shadow-none'
                                    }`}
                                >
                                    <Printer className="h-4 w-4" />
                                    <span>In hoá đơn</span>
                                </Button>
                            </>
                        }
                    />

                    {/* --- BANNER CHỐT ĐƠN (Chỉ hiện khi DRAFT) --- */}
                    {isDraft && (
                        <div className="mt-2 py-6 border-y border-blue-200 bg-blue-50/50 -mx-6 px-6 lg:-mx-10 lg:px-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="max-w-3xl">
                                <h4 className="text-blue-900 font-bold flex items-center gap-2 text-lg">
                                    <AlertTriangle className="h-5 w-5 text-blue-600" />
                                    Đơn hàng đang ở trạng thái Nháp
                                </h4>
                                <p className="text-blue-800/80 text-sm mt-1 leading-relaxed">
                                    Vui lòng kiểm tra kỹ thông tin khách hàng và máy bán trước khi chốt đơn. 
                                    Sau khi chốt, các thông tin chính sẽ được khoá để đảm bảo tính chính xác khi in hoá đơn.
                                </p>
                            </div>
                            <Button 
                                onClick={handleLockSale}
                                disabled={isLocking}
                                className="flex items-center justify-center gap-3 px-6 py-6 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold text-base transition-all shadow-xl shadow-slate-200 ring-4 ring-white min-w-[200px]"
                            >
                                {isLocking ? <Loader2 className="animate-spin" /> : <UnlockKeyhole className="h-5 w-5" />}
                                <span>Chốt đơn bán</span>
                            </Button>
                        </div>
                    )}

                    {/* 3. INFO GRIDS */}
                    <div className="mt-2 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* CARD A: KHÁCH HÀNG */}
                        <DetailCard
                            title="Thông tin khách hàng"
                            icon={<User className="h-5 w-5 text-blue-600" />}
                        >
                            <div className="flex flex-col gap-5">
                                <InfoBlock
                                    label="Họ và tên"
                                    value={invoice.customer_name}
                                />
                                <InfoBlock
                                    label="Số điện thoại"
                                    value={invoice.customer_phone}
                                    valueClassName="text-base text-slate-900 font-medium tracking-wide"
                                />
                                {/* ĐÃ SỬA: Đổi Địa chỉ thành CCCD */}
                                <InfoBlock
                                    label="Số CCCD"
                                    value={invoice.customer_id_number}
                                    valueClassName="text-base text-slate-900 font-medium font-mono tracking-wide"
                                />
                            </div>
                        </DetailCard>

                        {/* CARD B: MÁY BÁN */}
                        <DetailCard
                            title="Thông tin máy bán"
                            icon={
                                <Smartphone className="h-5 w-5 text-indigo-600" />
                            }
                            iconClassName="bg-indigo-100"
                        >
                            {phoneItem ? (
                                <div className="flex flex-col gap-5">
                                    <InfoBlock
                                        label="Đời máy"
                                        value={phoneItem.description}
                                        valueClassName="text-lg text-slate-900 font-bold"
                                    />

                                    <div className="grid grid-cols-2 gap-5">
                                        <InfoBlock
                                            label="IMEI"
                                            value={
                                                <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-sm">
                                                    {phoneItem.imei}
                                                </span>
                                            }
                                        />
                                        <InfoBlock
                                            label="Màu sắc"
                                            value={details?.color}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <InfoBlock
                                            label="Thời gian bảo hành"
                                            value={
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    <span>
                                                        {
                                                            phoneItem.warranty_months
                                                        }{' '}
                                                        tháng
                                                    </span>
                                                </div>
                                            }
                                        />
                                        {/* ĐÃ SỬA: Đổi Ngoại quan thành RAM/ROM */}
                                        <InfoBlock
                                            label="RAM / Dung lượng"
                                            value={`${details?.ram || '---'} / ${details?.storage || '---'}`}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <p className="italic text-slate-500">
                                    Không có thông tin thiết bị
                                </p>
                            )}
                        </DetailCard>

                        {/* CARD C: THANH TOÁN */}
                        <DetailCard
                            title="Thông tin thanh toán"
                            icon={
                                <CreditCard className="h-5 w-5 text-green-600" />
                            }
                            iconClassName="bg-green-100"
                        >
                            <div className="flex h-full flex-col gap-5">
                                <div className="grid grid-cols-2 gap-5">
                                    <InfoBlock
                                        label="Ngày bán"
                                        value={formatDate(invoice.created_at)}
                                    />
                                    <InfoBlock
                                        label="Hình thức thanh toán"
                                        value={
                                            invoice.payment_method === 'CASH' ? 'Tiền mặt' :
                                            invoice.payment_method === 'TRANSFER' ? 'Chuyển khoản' :
                                            invoice.payment_method === 'CARD' ? 'Quẹt thẻ' : 
                                            invoice.payment_method || '---'
                                        }
                                    />
                                </div>

                                <div className="mt-auto border-t border-slate-100 pt-5 flex flex-col gap-3">
                                    <div className="flex items-center justify-between text-[14px]">
                                        <span className="font-medium text-slate-500">Giá máy</span>
                                        <span className="font-bold text-slate-900">
                                            {formatCurrency(originalPrice)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-[14px]">
                                        <span className="font-medium text-slate-500">Giảm giá</span>
                                        <span className="font-bold text-emerald-600">
                                            - {formatCurrency(discountAmount)}
                                        </span>
                                    </div>

                                    <div className="mt-2 flex items-end justify-between border-t border-dashed border-slate-200 pt-4">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">
                                                Khách cần trả
                                            </span>
                                            {invoice.status === 'PAID' ? (
                                                <div className="flex items-center gap-1.5 rounded bg-emerald-50 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-600">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Đã thu tiền
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 rounded bg-amber-50 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-600">
                                                    <AlertTriangle className="h-3.5 w-3.5" />
                                                    Chưa thu tiền
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[32px] font-black leading-none tracking-tight text-blue-600">
                                            {formatCurrency(invoice.total_amount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </DetailCard>

                        {/* CARD D: GHI CHÚ */}
                        <DetailCard
                            title="Ghi chú"
                            icon={
                                <FileText className="h-5 w-5 text-orange-600" />
                            }
                            iconClassName="bg-orange-100"
                        >
                            <div className="h-full">
                                <div className="h-full min-h-[120px] rounded-lg border border-yellow-100 bg-yellow-50 p-4">
                                    <p className="whitespace-pre-wrap text-sm italic leading-relaxed text-slate-700">
                                        {invoice.note
                                            ? `"${invoice.note}"`
                                            : 'Không có ghi chú.'}
                                    </p>
                                </div>
                            </div>
                        </DetailCard>
                    </div>
                </div>
            </div>

            {/* Thêm Modal vào cuối */}
            {invoice && (
                <EditSaleModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={() => {
                        window.location.reload() 
                    }}
                    invoice={invoice}
                />
            )}
        </div>
    )
}