'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    Printer,
    Edit,
    User,
    Smartphone,
    CreditCard,
    FileText,
    CheckCircle2,
} from 'lucide-react'

// Services & Types
import { invoiceService } from '@/services/invoice.service'
import { Invoice } from '@/types/invoice'

// Components UI & Utils
import { Button } from '@/components/ui/button'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import PageBreadcrumb from '@/components/common/PageBreadcrumb'
import DetailCard from '@/components/common/detail/DetailCard'
import PageHeader from '@/components/common/detail/PageHeader'
import { useToast } from '@/hooks/use-toast'
import InvoiceStatusBadge from '@/components/common/badges/InvoiceStatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useInvoiceDetail } from '@/hooks/useInvoiceDetail'
import PageLoading from '@/components/common/PageLoading'

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
    const { invoice, isLoading } = useInvoiceDetail(Number(id))

    if (isLoading) return <PageLoading title="Chi tiết hoá đơn" />
    if (!invoice) return null

    // Lấy item điện thoại đầu tiên để hiển thị chi tiết
    const phoneItem = invoice.items?.find((i) => i.item_type === 'PHONE')

    return (
        <div className="flex h-full flex-col bg-[#f8fafc]">
            <DashboardHeader title="Chi tiết hoá đơn" />

            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
                    {/* 1. BREADCRUMB */}
                    <PageBreadcrumb
                        items={[
                            { label: 'Trang chủ', href: '/dashboard' },
                            { label: 'Bán hàng', href: '/dashboard/sales' },
                            { label: 'Chi tiết hoá đơn' },
                        ]}
                    />

                    {/* 2. HEADER */}
                    <PageHeader
                        title={invoice.customer_name || 'Khách lẻ'}
                        status={<InvoiceStatusBadge status={invoice.status} />}
                        subtitle={
                            <>
                                Mã hoá đơn:{' '}
                                <span className="font-mono font-semibold text-slate-700">
                                    #{invoice.invoice_code || '---'}
                                </span>
                            </>
                        }
                        actions={
                            <>
                                <Button
                                    variant="outline"
                                    className="gap-2 border-slate-300 bg-white text-slate-700 shadow-sm hover:border-primary hover:text-primary"
                                >
                                    <Edit className="h-4 w-4" />
                                    <span>Sửa thông tin</span>
                                </Button>
                                <Button className="gap-2 bg-primary text-white shadow-md shadow-primary/20 hover:bg-blue-600">
                                    <Printer className="h-4 w-4" />
                                    <span>In hoá đơn</span>
                                </Button>
                            </>
                        }
                    />

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
                                <InfoBlock
                                    label="Địa chỉ"
                                    value="---" // Backend chưa có field này, để placeholder
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
                                            value={
                                                phoneItem.phone_details?.color
                                            }
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
                                        <InfoBlock
                                            label="Tình trạng máy"
                                            value={
                                                phoneItem.phone_details
                                                    ?.appearance
                                            }
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
                                        // TODO: Cần update BE để trả về Payment Method chính xác. Tạm thời hardcode hoặc lấy từ Note nếu có logic parse.
                                        value="Chuyển khoản / Tiền mặt"
                                    />
                                </div>

                                <div className="mt-auto border-t border-dashed border-slate-200 pt-4">
                                    <InfoBlock
                                        label="Tổng giá bán"
                                        value={formatCurrency(
                                            invoice.total_amount,
                                        )}
                                        valueClassName="text-2xl text-primary font-bold"
                                    />
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
        </div>
    )
}
