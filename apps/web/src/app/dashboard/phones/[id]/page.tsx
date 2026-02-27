// src/app/dashboard/phones/[id]/page.tsx
'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import {
    Printer,
    Edit,
    Smartphone,
    Download,
    FileText,
    Loader2,
    AlertTriangle,
    LockKeyholeOpen,
} from 'lucide-react'

// Import Hook Logic vừa tách
import { usePhoneDetail } from '@/hooks/phone/usePhoneDetail'

import { Button } from '@/components/ui/button'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import PageBreadcrumb from '@/components/common/PageBreadcrumb'
import DetailCard from '@/components/common/detail/DetailCard'
import DetailRow from '@/components/common/detail/DetailRow'
import PageHeader from '@/components/common/detail/PageHeader'
import EditPhoneModal from '@/components/phones/import/EditPhoneModal'
import { usePrintInvoice } from '@/hooks/invoice/usePrintInvoice'
import PhoneStatusBadge from '@/components/common/badges/PhoneStatusBadge'
import InvoicePreviewModal from '@/components/invoices/InvoicePreviewModal'
import PageLoading from '@/components/common/PageLoading'
import { useLockImport } from '@/hooks/invoice/useLockImportInvoice'

export default function PhoneDetailPage() {
    const { id } = useParams()

    // 1. Sử dụng Hook để lấy dữ liệu và logic
    const { phone, isLoading, formatCurrency, formatDateForInput, refresh } =
        usePhoneDetail(Number(id))
    // 2. Logic Hook (In hoá đơn)
    const {
        isInvoiceModalOpen,
        setIsInvoiceModalOpen,
        activeInvoiceId,
        handlePrintInvoice,
    } = usePrintInvoice({ phone })

    const { handleLockImport, isLocking } = useLockImport({
        phone,
        onSuccess: refresh,
        onRequireUpdate: () => setIsEditModalOpen(true)
    })

    // 3. UI State (Edit Modal)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const canPrint = phone?.invoice_status === 'PAID'
    const isDraft = phone?.invoice_status === 'DRAFT'

    if (isLoading) return <PageLoading title="Chi tiết máy" />

    if (!phone) return null

    return (
        <div className="flex h-full flex-col bg-[#f8fafc]">
            <DashboardHeader title="Chi tiết máy" />

            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
                    {/* Navigation */}
                    <PageBreadcrumb
                        items={[
                            { label: 'Trang chủ', href: '/dashboard' },
                            { label: 'Nhập máy', href: '/dashboard/import' },
                            { label: 'Chi tiết' },
                        ]}
                    />

                    {/* Title Section */}
                    <PageHeader
                        // Title
                        title={phone.model_name}
                        // Status Badge
                        status={<PhoneStatusBadge status={phone.status} />}
                        // Subtitle (Mã hoá đơn...)
                        subtitle={
                            <>
                                Mã hoá đơn:{' '}
                                <span className="font-mono font-semibold text-slate-700">
                                    #{phone.invoice_code || '---'}
                                </span>
                                {/* Hiển thị thêm trạng thái hoá đơn nhập để dễ hiểu */}
                                {phone.invoice_status && (
                                    <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded ${
                                        phone.invoice_status === 'PAID' 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {phone.invoice_status === 'PAID' ? 'HOÀN THÀNH' : 'NHÁP'}
                                    </span>
                                )}
                            </>
                        }
                        // Action Buttons
                        actions={
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="gap-2 bg-white text-slate-700 shadow-sm hover:border-primary/50 hover:text-primary"
                                >
                                    <Edit className="h-5 w-5" />
                                    <span>Sửa thông tin</span>
                                </Button>
                                <Button
                                    onClick={handlePrintInvoice}
                                    disabled={!canPrint}
                                    className={`gap-2 text-white shadow-md transition-all ${
                                        canPrint 
                                        ? 'bg-primary hover:bg-blue-600 shadow-primary/20' 
                                        : 'bg-slate-300 cursor-not-allowed shadow-none'
                                    }`}
                                >
                                    <Printer className="h-5 w-5" />
                                    <span>In hoá đơn</span>
                                </Button>
                            </>
                        }
                    />

                    {/* BANNER CHỐT NHẬP KHO */}
                    {isDraft && (
                        <div className="mt-2 py-6 border-y border-blue-200 bg-blue-50/50 -mx-6 px-6 lg:-mx-10 lg:px-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="max-w-3xl">
                                <h4 className="text-blue-900 font-bold flex items-center gap-2 text-lg">
                                    <AlertTriangle className="h-5 w-5 text-blue-600" />
                                    Quy trình hoàn tất nhập kho
                                </h4>
                                <p className="text-blue-800/80 text-sm mt-1 leading-relaxed">
                                    Vui lòng kiểm tra kỹ các thông tin chi tiết dưới đây trước khi thực hiện chốt nhập kho. 
                                    Sau khi chốt, các thông tin hoá đơn sẽ được khoá để đảm bảo tính minh bạch và bạn có thể in phiếu nhập.
                                </p>
                            </div>
                            <Button 
                                onClick={handleLockImport}
                                disabled={isLocking}
                                className="flex items-center justify-center gap-3 px-6 py-6 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold text-base transition-all shadow-xl shadow-slate-200 ring-4 ring-white min-w-[200px]"
                            >
                                {isLocking ? <Loader2 className="animate-spin" /> : <LockKeyholeOpen className="h-5 w-5" />}
                                <span>Chốt nhập kho</span>
                            </Button>
                        </div>
                    )}

                    {/* Grid Info */}
                    <div className="mt-4 grid flex-1 grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                        {/* CARD 1: THÔNG TIN CƠ BẢN */}
                        <DetailCard
                            title="Thông tin cơ bản"
                            icon={
                                <Smartphone className="h-5 w-5 text-blue-500" />
                            }
                        >
                            <DetailRow
                                label="IMEI"
                                value={
                                    <span className="font-mono font-bold text-slate-800">
                                        {phone.imei}
                                    </span>
                                }
                            />
                            <DetailRow
                                label="Đời máy"
                                value={phone.model_name}
                            />
                            <DetailRow
                                label="Giá bán"
                                value={
                                    <span className="text-2xl font-bold text-blue-600">
                                        {formatCurrency(phone.sale_price || 0)}
                                    </span>
                                }
                            />
                            <DetailRow
                                label="Màu sắc"
                                value={
                                    <span className="flex items-center justify-end gap-2">
                                        {phone.details?.color && (
                                            <span className="h-4 w-4 rounded-full border border-slate-200 bg-slate-800 shadow-sm"></span>
                                        )}
                                        {phone.details?.color || '---'}
                                    </span>
                                }
                            />
                            <DetailRow
                                label="Dung lượng"
                                value={phone.details?.storage || '---'}
                            />
                            <DetailRow
                                label="Pin"
                                value={
                                    phone.details?.battery ? (
                                        <span className="font-bold text-green-600">
                                            {phone.details.battery}%
                                        </span>
                                    ) : (
                                        '---'
                                    )
                                }
                            />
                            <div className="flex flex-col gap-2 pt-2">
                                <span className="text-base text-slate-500">
                                    Ngoại quan
                                </span>
                                <span className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-base font-medium leading-relaxed text-slate-800">
                                    {phone.details?.appearance ||
                                        'Không có mô tả'}
                                </span>
                            </div>
                        </DetailCard>

                        {/* CARD 2: THÔNG TIN NHẬP HÀNG */}
                        <DetailCard
                            title="Thông tin nhập hàng"
                            icon={
                                <Download className="h-5 w-5 text-green-600" />
                            }
                        >
                            <DetailRow
                                label="Ngày nhập"
                                value={formatDateForInput(phone.purchase_date)}
                            />
                            <DetailRow
                                label="Giá nhập"
                                value={
                                    <span className="text-2xl font-bold text-red-600">
                                        {formatCurrency(phone.purchase_price)}
                                    </span>
                                }
                            />
                            <DetailRow
                                label="Người bán"
                                value={phone.seller_name || 'Vãng lai'}
                            />
                            <DetailRow
                                label="Số điện thoại"
                                value={
                                    phone.seller_phone ? (
                                        <a
                                            href={`tel:${phone.seller_phone}`}
                                            className="text-primary hover:underline"
                                        >
                                            {phone.seller_phone}
                                        </a>
                                    ) : (
                                        '---'
                                    )
                                }
                            />
                            <DetailRow
                                label="Số CCCD"
                                value={
                                    <span className="font-mono">
                                        {phone.seller_id || '---'}
                                    </span>
                                }
                            />
                            <DetailRow
                                isLast
                                label="Người nhập"
                                value={
                                    <span className="rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                                        {phone.importer_name || 'Admin'}
                                    </span>
                                }
                            />
                        </DetailCard>

                        {/* CARD 3: GHI CHÚ */}
                        <DetailCard
                            title="Ghi chú chi tiết"
                            icon={
                                <FileText className="h-5 w-5 text-amber-500" />
                            }
                            className="lg:col-span-2 xl:col-span-1"
                        >
                            <div className="relative h-full min-h-[200px] overflow-auto rounded-lg border border-amber-100 bg-amber-50/50 p-6 text-base italic leading-loose text-slate-700">
                                <span className="absolute left-4 top-4 font-serif text-4xl text-amber-200 opacity-50">
                                    &quot;
                                </span>
                                <p className="indent-6">
                                    {phone.note ||
                                        'Không có ghi chú nào cho máy này.'}
                                </p>
                            </div>
                        </DetailCard>
                    </div>
                </div>
            </div>

            {/* Thêm Component Modal */}
            <EditPhoneModal
                phone={phone}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={() => {
                    refresh() // Load lại dữ liệu sau khi sửa xong
                    setIsEditModalOpen(false)
                }}
            />

            {/* Invoice Modal */}
            {activeInvoiceId > 0 && (
                <InvoicePreviewModal
                    isOpen={isInvoiceModalOpen}
                    onClose={() => setIsInvoiceModalOpen(false)}
                    phone={phone}
                    invoiceId={activeInvoiceId}
                />
            )}
        </div>
    )
}
