// apps/web/src/app/dashboard/invoices/[id]/page.tsx
'use client'

import { useParams, useRouter } from 'next/navigation'
import { 
    Printer, 
    ExternalLink, 
    User, 
    CreditCard, 
    FileText, 
    PackageSearch
} from 'lucide-react'

// Components UI & Utils
import { Button } from '@/components/ui/button'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import PageBreadcrumb from '@/components/common/PageBreadcrumb'
import DetailCard from '@/components/common/detail/DetailCard'
import PageHeader from '@/components/common/detail/PageHeader'
import InvoiceStatusBadge from '@/components/common/badges/InvoiceStatusBadge'
import PageLoading from '@/components/common/PageLoading'

import { formatCurrency, formatDate } from '@/lib/utils'
import { useInvoiceDetail } from '@/hooks/invoice/useInvoiceDetail'
import { useToast } from '@/hooks/use-toast'

// --- LOCAL COMPONENT: InfoBlock ---
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
    <div className={`flex flex-col gap-1.5 ${className}`}>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {label}
        </span>
        <div className={valueClassName}>{value || '---'}</div>
    </div>
)

export default function InvoiceDetailPage() {
    const { id } = useParams()
    const { toast } = useToast()
    const { invoice, isLoading } = useInvoiceDetail(Number(id))
    const router = useRouter()

    if (isLoading) return <PageLoading title="Chi tiết hoá đơn" />
    if (!invoice) return null

    // Hàm render Badge cho Loại hoá đơn
    const getInvoiceTypeBadge = (type: string) => {
        switch (type) {
            case 'SALE': 
                return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-100">Bán máy</span>
            case 'REPAIR': 
                return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-semibold text-fuchsia-600 bg-fuchsia-50 border border-fuchsia-100">Sửa chữa</span>
            case 'IMPORT': 
                return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-semibold text-orange-600 bg-orange-50 border border-orange-100">Nhập máy</span>
            default: 
                return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-100">Khác</span>
        }
    }

    // Dịch Phương thức thanh toán
    const getPaymentMethod = (method?: string) => {
        switch (method) {
            case 'CASH': return 'Tiền mặt'
            case 'TRANSFER': return 'Chuyển khoản'
            case 'CARD': return 'Quẹt thẻ'
            default: return method || '---'
        }
    }

    // Xử lý nút Xem nguồn đơn
    const handleViewSource = () => {
        if (invoice.type === 'REPAIR') {
            if (invoice.repair_id) {
                router.push(`/dashboard/repairs/${invoice.repair_id}`)
            } else {
                toast({ title: 'Lỗi', description: 'Không tìm thấy ID phiếu sửa chữa gốc.', variant: 'destructive' })
            }
        } else if (invoice.type === 'SALE') {
            router.push(`/dashboard/sales/${invoice.id}`) 
        } else if (invoice.type === 'IMPORT') {
            const phoneId = invoice.items?.[0]?.phone_id
            if (phoneId) {
                router.push(`/dashboard/phones/${phoneId}`) 
            } else {
                toast({ title: 'Lỗi', description: 'Hoá đơn nhập này không chứa thiết bị nào.', variant: 'destructive' })
            }
        } else {
            toast({ title: 'Thông báo', description: 'Không hỗ trợ xem nguồn cho hoá đơn này.' })
        }
    }

    // Tính toán lại Tổng tiền gốc (Subtotal) dựa trên dữ liệu chuẩn
    const discountValue = invoice.discount || 0
    const finalAmount = invoice.total_amount || 0
    const subTotal = finalAmount + discountValue

    return (
        <div className="flex h-full flex-col bg-[#f8fafc]">
            <DashboardHeader title={`Chi tiết Hoá đơn ${invoice.invoice_code}`} />

            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
                    {/* BREADCRUMB */}
                    <PageBreadcrumb
                        items={[
                            { label: 'Trang chủ', href: '/dashboard' },
                            { label: 'Hoá đơn', href: '/dashboard/invoices' },
                            { label: invoice.invoice_code },
                        ]}
                    />

                    {/* HEADER */}
                    <PageHeader
                        title={invoice.invoice_code}
                        status={<InvoiceStatusBadge status={invoice.status} />}
                        subtitle={
                            <span className="text-slate-500 text-sm font-medium">
                                Giao dịch đã chốt và ghi nhận vào hệ thống
                            </span>
                        }
                        actions={
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handleViewSource}
                                    className="gap-2 border-slate-300 bg-white shadow-sm text-slate-700 hover:border-blue-600 hover:text-blue-600 font-semibold transition-colors"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    <span>Xem nguồn đơn</span>
                                </Button>
                                <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 font-semibold px-6">
                                    <Printer className="h-4 w-4" />
                                    <span>In hoá đơn</span>
                                </Button>
                            </>
                        }
                    />

                    {/* THÔNG TIN CHUNG (GRID 2 CỘT) */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* CỘT 1: KHÁCH HÀNG */}
                        <DetailCard
                            title={invoice.type === 'IMPORT' ? 'Đối tác / Người bán' : 'Thông tin khách hàng'}
                            icon={<User className="h-5 w-5 text-blue-600" />}
                            iconClassName="bg-blue-50 text-blue-600"
                        >
                            <div className="flex flex-col gap-5 mt-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoBlock label="Họ và tên" value={invoice.customer_name || 'Khách vãng lai'} />
                                    <InfoBlock label="Số điện thoại" value={invoice.customer_phone || '---'} />
                                </div>
                                <InfoBlock label="CCCD / CMND" value={invoice.customer_id_number || '---'} />
                            </div>
                        </DetailCard>

                        {/* CỘT 2: THANH TOÁN & HỆ THỐNG */}
                        <DetailCard
                            title="Thông tin giao dịch"
                            icon={<CreditCard className="h-5 w-5 text-emerald-600" />}
                            iconClassName="bg-emerald-50 text-emerald-600"
                        >
                            <div className="flex flex-col gap-5 mt-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoBlock 
                                        label="Loại giao dịch" 
                                        value={getInvoiceTypeBadge(invoice.type)} 
                                    />
                                    <InfoBlock 
                                        label="Thời gian tạo" 
                                        value={formatDate(invoice.created_at)} 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoBlock 
                                        label="Phương thức" 
                                        value={getPaymentMethod(invoice.payment_method)} 
                                    />
                                    <InfoBlock 
                                        label="Người lập đơn" 
                                        value={invoice.creator_name || 'Hệ thống'} 
                                        valueClassName="text-base text-blue-700 font-bold"
                                    />
                                </div>
                            </div>
                        </DetailCard>
                    </div>

                    {/* DANH SÁCH SẢN PHẨM / DỊCH VỤ */}
                    <DetailCard
                        title="Danh sách Sản phẩm / Dịch vụ"
                        icon={<PackageSearch className="h-5 w-5 text-purple-600" />}
                        iconClassName="bg-purple-50 text-purple-600"
                        bodyClassName="p-0"
                    >
                        <div className="w-full overflow-x-auto border-t border-slate-100">
                            <table className="w-full text-left text-sm text-slate-700">
                                <thead className="bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4 text-center w-16">STT</th>
                                        <th className="px-6 py-4">Tên mục</th>
                                        <th className="px-6 py-4 text-right">Đơn giá</th>
                                        <th className="px-6 py-4 text-center">SL</th>
                                        <th className="px-6 py-4 text-center">Bảo hành</th>
                                        <th className="px-6 py-4 text-right">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {invoice.items && invoice.items.length > 0 ? (
                                        invoice.items.map((item, index) => {
                                            const isService = item.item_type === 'SERVICE' || item.item_type === 'TIỀN CÔNG'

                                            // ĐÃ FIX: Logic tính toán hiển thị thẻ Bảo hành
                                            let warrantyUI = <span className="text-slate-400">---</span>

                                            if (item.warranty_months && item.warranty_months > 0) {
                                                // Nếu có tháng bảo hành (Linh kiện, Máy)
                                                warrantyUI = (
                                                    <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-md font-semibold">
                                                        {item.warranty_months} tháng
                                                    </span>
                                                )
                                            } else if (isService && item.warranty_expiry) {
                                                // Nếu là Dịch vụ (Công thợ) và có ngày hết hạn -> Tính ra số ngày
                                                const createdDate = new Date(invoice.created_at)
                                                const expiryDate = new Date(item.warranty_expiry)
                                                const diffTime = expiryDate.getTime() - createdDate.getTime()
                                                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
                                                
                                                if (diffDays > 0) {
                                                    warrantyUI = (
                                                        <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-md font-semibold">
                                                            {diffDays} ngày
                                                        </span>
                                                    )
                                                }
                                            }

                                            return (
                                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 text-center font-medium text-slate-500">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-slate-800">{item.description || 'Sản phẩm/Dịch vụ'}</div>
                                                        {item.imei && (
                                                            <div className="text-xs text-slate-500 mt-0.5 font-mono">IMEI: {item.imei}</div>
                                                        )}
                                                    </td>
                                                    <td className={`px-6 py-4 text-right font-medium ${item.unit_price < 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                                                        {formatCurrency(item.unit_price)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-medium text-slate-600">
                                                        {isService ? <span className="text-slate-400">---</span> : item.quantity}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-xs">
                                                        {/* Render thẻ bảo hành đã tính toán */}
                                                        {warrantyUI}
                                                    </td>
                                                    <td className={`px-6 py-4 text-right font-bold ${item.amount < 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                        {formatCurrency(item.amount)}
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-slate-500 italic">
                                                Không có dữ liệu sản phẩm.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </DetailCard>

                    {/* GHI CHÚ & TỔNG TIỀN */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <DetailCard
                                title="Ghi chú hoá đơn"
                                icon={<FileText className="h-5 w-5 text-amber-600" />}
                                iconClassName="bg-amber-50 text-amber-600"
                                className="h-full"
                            >
                                <div className="mt-2 h-full min-h-[100px] rounded-xl border border-amber-100/50 bg-amber-50/30 p-5">
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-amber-900 font-medium">
                                        {invoice.note || 'Không có ghi chú.'}
                                    </p>
                                </div>
                            </DetailCard>
                        </div>

                        {/* BLOCK TỔNG TIỀN (GIAO DIỆN ĐÃ FIX) */}
                        <DetailCard
                                title="Tổng thanh toán"
                                icon={<FileText className="h-5 w-5 text-amber-600" />}
                                iconClassName="bg-amber-50 text-amber-600"
                                className="h-full flex flex-col justify-between"
                        >    
                            <div className="flex flex-col gap-3.5 mt-2">
                                {/* Dòng Tổng tiền gốc (Subtotal) */}
                                <div className="flex justify-between items-center text-[15px]">
                                    <span className="text-slate-500 font-medium">Tổng tiền hàng</span>
                                    <span className="text-slate-900 font-bold">{formatCurrency(subTotal)}</span>
                                </div>

                                {/* Dòng Giảm giá (Chỉ hiển thị nếu có giảm giá) */}
                                {discountValue > 0 && (
                                    <div className="flex justify-between items-center text-[15px]">
                                        <span className="text-slate-500 font-medium">Khách được giảm</span>
                                        <span className="text-emerald-600 font-bold">- {formatCurrency(discountValue)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Dòng Tổng cộng thanh toán */}
                            <div className="border-t border-slate-100 border-dashed pt-5 mt-auto flex justify-between items-end">
                                <div className="flex flex-col gap-2">
                                    <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">
                                        Khách cần trả
                                    </span>
                                    {invoice.status === 'PAID' ? (
                                        <span className="inline-flex w-fit items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase tracking-wide">
                                            Đã thu đủ tiền
                                        </span>
                                    ) : invoice.status === 'DRAFT' ? (
                                        <span className="inline-flex w-fit items-center text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded uppercase tracking-wide">
                                            Chưa thu tiền
                                        </span>
                                    ) : (
                                        <span className="inline-flex w-fit items-center text-[11px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded uppercase tracking-wide">
                                            Đã huỷ
                                        </span>
                                    )}
                                </div>
                                <span className="text-[32px] leading-none font-black text-blue-600 tracking-tight">
                                    {formatCurrency(finalAmount)}
                                </span>
                            </div>
                        </DetailCard>
                    </div>
                </div>
            </div>
        </div>
    )
}