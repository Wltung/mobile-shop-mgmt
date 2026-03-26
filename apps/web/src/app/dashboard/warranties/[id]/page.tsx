// apps/web/src/app/dashboard/warranties/[id]/page.tsx
'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
    Edit, Printer, User, Smartphone, Calendar, 
    AlertCircle, FileText, Copy, CheckCircle2, ShoppingCart, Wrench 
} from 'lucide-react'

// Hooks & Types
import { formatCurrency, formatJustDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

// Components
import { Button } from '@/components/ui/button'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import PageBreadcrumb from '@/components/common/PageBreadcrumb'
import DetailCard from '@/components/common/detail/DetailCard'
import PageHeader from '@/components/common/detail/PageHeader'
import PageLoading from '@/components/common/PageLoading'
import { useWarrantyDetail } from '@/hooks/warranty/useWarrantyDetail'
import WarrantyStatusBadge from '@/components/common/badges/WarrantyStatusBadge'
import EditWarrantyModal from '@/components/phones/warranties/EditWarrantyModal'

// --- LOCAL COMPONENT: InfoBlock ---
const InfoBlock = ({
    label,
    value,
    className = '',
    valueClassName = 'text-[15px] text-slate-900 font-semibold',
    allowCopy = false,
    copyValue = ''
}: {
    label: string
    value: React.ReactNode
    className?: string
    valueClassName?: string
    allowCopy?: boolean
    copyValue?: string
}) => {
    const { toast } = useToast()

    const handleCopy = () => {
        if (copyValue) {
            navigator.clipboard.writeText(copyValue)
            toast({ title: 'Đã sao chép', description: copyValue, duration: 2000 })
        }
    }

    return (
        <div className={`flex flex-col ${className}`}>
            <span className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {label}
            </span>
            <div className="flex items-center gap-2">
                <div className={valueClassName}>{value || '---'}</div>
                {allowCopy && copyValue && (
                    <button onClick={handleCopy} className="text-slate-400 hover:text-blue-600 transition-colors">
                        <Copy className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    )
}

export default function WarrantyDetailPage() {
    const { id } = useParams()
    const { warranty, isLoading, daysRemaining, isExpired, refresh } = useWarrantyDetail(Number(id))
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    if (isLoading) return <PageLoading title="Chi tiết tiếp nhận bảo hành" />
    if (!warranty) return null

    const isSale = warranty.type === 'SALE'
    const isLocked = warranty.status === 'DONE' || warranty.status === 'CANCELLED'

    // --- TÍNH TOÁN NGÀY KÍCH HOẠT (DYNAMIC) ---
    let activationDate = warranty.start_date ? warranty.start_date : null
    
    if (warranty.end_date) {
        const end = new Date(warranty.end_date)
        if (warranty.type === 'REPAIR') {
            // Máy sửa (Thợ): Mặc định lùi 7 ngày
            end.setDate(end.getDate() - 7)
            activationDate = end.toISOString()
        } else if (warranty.warranty_months) {
            // Máy bán: Lùi theo đúng số tháng bảo hành của hoá đơn
            end.setMonth(end.getMonth() - warranty.warranty_months)
            activationDate = end.toISOString()
        }
    }
    const displayStartDate = activationDate ? formatJustDate(activationDate) : '---'

    // --- BÓC TÁCH DỮ LIỆU SẠCH 100% TỪ JSON ---
    const descJson = warranty.description_json || {}
    const techJson = warranty.technical_note_json || {}

    const receiveStatus = descJson.condition || 'Không có ghi chú.'
    const customerFaultNote = descJson.fault || 'Không có mô tả lỗi.'
    const partName = descJson.part_name || ''

    const specialNote = techJson.special_note || 'Không có'
    const warrantyCondition = techJson.warranty_condition || 'Theo quy định chuẩn'

    // --- LOGIC RENDER TRẠNG THÁI DƯỚI CÙNG ---
    let currentStatusUI = (
        <div className="flex items-center gap-2 text-blue-600 font-bold">
            <Wrench className="h-5 w-5" />
            Đang được bảo hành
        </div>
    )
    if (warranty.status === 'DONE') {
        currentStatusUI = (
            <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <CheckCircle2 className="h-5 w-5" />
                Đã hoàn tất
            </div>
        )
    } else if (warranty.status === 'CANCELLED') {
        currentStatusUI = (
            <div className="flex items-center gap-2 text-red-600 font-bold">
                <AlertCircle className="h-5 w-5" />
                Đã huỷ bảo hành
            </div>
        )
    }

    return (
        <div className="flex h-full flex-col bg-[#f8fafc]">
            <DashboardHeader title="Chi tiết Tiếp nhận Bảo hành" />

            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
                    {/* 1. BREADCRUMB */}
                    <PageBreadcrumb
                        items={[
                            { label: 'Trang chủ', href: '/dashboard' },
                            { label: 'Bảo hành', href: '/dashboard/warranties' },
                            { label: 'Chi tiết phiếu' },
                        ]}
                    />

                    {/* 2. HEADER */}
                    <PageHeader
                        title={warranty.customer_name || 'Khách hàng'}
                        status={<WarrantyStatusBadge status={warranty.status} />}
                        subtitle={
                            <div className="flex items-center text-[15px] mt-1.5 text-slate-500">
                                <span className="mr-1.5">Mã phiếu:</span>
                                <span className="font-mono font-bold text-slate-900 mr-3">
                                    {warranty.warranty_code || `BH-${String(warranty.id).padStart(6, '0')}`}
                                </span>
                                
                                <span className="text-slate-300 mr-3">|</span>
                                
                                <span className="mr-1.5">HĐ gốc:</span>
                                <Link 
                                    href={`/dashboard/invoices/${warranty.invoice_id}`}
                                    className="font-mono bg-white border border-slate-200 shadow-sm text-slate-700 px-2.5 py-0.5 rounded-md hover:text-blue-600 hover:border-blue-300 transition-all font-semibold"
                                    title="Xem hoá đơn gốc"
                                >
                                    {warranty.invoice_code || `#HD-${warranty.invoice_id}`}
                                </Link>
                            </div>
                        }
                        actions={
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => !isLocked && setIsEditModalOpen(true)}
                                    disabled={isLocked}
                                    title={isLocked ? 'Phiếu đã đóng (Hoàn thành / Huỷ) nên không thể chỉnh sửa' : 'Sửa thông tin phiếu'}
                                    className="gap-2 border-slate-300 bg-white shadow-sm text-slate-700 hover:border-blue-600 hover:text-blue-600 font-semibold disabled:opacity-50 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:hover:border-slate-200"
                                >
                                    <Edit className="h-4 w-4" />
                                    <span>Sửa thông tin</span>
                                </Button>
                                <Button 
                                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 font-semibold px-6"
                                >
                                    <Printer className="h-4 w-4" />
                                    <span>In phiếu bảo hành</span>
                                </Button>
                            </>
                        }
                    />

                    {/* 3. INFO GRIDS */}
                    <div className="mt-2 flex flex-col gap-6">
                        
                        {/* HÀNG 1: 3 CỘT (Khách hàng | Thiết bị | Thời hạn) */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            
                            {/* CARD 1: KHÁCH HÀNG */}
                            <DetailCard title="Thông tin khách hàng" icon={<User className="h-5 w-5 text-blue-600" />} iconClassName="bg-blue-50 text-blue-600">
                                <div className="flex flex-col gap-6 mt-2">
                                    <InfoBlock label="Họ và tên" value={warranty.customer_name || 'Khách vãng lai'} />
                                    <InfoBlock 
                                        label="Số điện thoại" 
                                        value={warranty.customer_phone} 
                                        allowCopy 
                                        copyValue={warranty.customer_phone || ''} 
                                    />
                                    {/* HIỂN THỊ CCCD ĐÃ KÉO TỪ DB */}
                                    <InfoBlock label="CCCD / CMND" value={warranty.customer_id_number || '---'} /> 
                                </div>
                            </DetailCard>

                            {/* CARD 2: THIẾT BỊ */}
                            <DetailCard title="Thông tin thiết bị" icon={<Smartphone className="h-5 w-5 text-purple-600" />} iconClassName="bg-purple-50 text-purple-600">
                                <div className="flex flex-col gap-5 mt-2">
                                    <InfoBlock label="Đời máy" value={warranty.device_name} />
                                    <InfoBlock 
                                        label="IMEI" 
                                        value={<span className="font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100">{warranty.imei || '---'}</span>} 
                                        allowCopy 
                                        copyValue={warranty.imei || ''}
                                    />
                                    
                                    {/* HIỂN THỊ THÊM LINH KIỆN NẾU LÀ PHIẾU SỬA CHỮA */}
                                    {partName && (
                                        <InfoBlock 
                                            label="Linh kiện / Dịch vụ" 
                                            value={<span className="text-blue-700 font-semibold">{partName}</span>} 
                                        />
                                    )}

                                    <InfoBlock 
                                        label="Loại bảo hành" 
                                        value={
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-semibold ${isSale ? 'bg-blue-50 text-blue-600' : 'bg-[#fff7ed] text-[#ea580c]'}`}>
                                                {isSale ? <ShoppingCart className="h-3.5 w-3.5" /> : <Wrench className="h-3.5 w-3.5" />}
                                                {isSale ? 'Bán máy' : 'Sửa chữa'}
                                            </span>
                                        } 
                                    />
                                </div>
                            </DetailCard>

                            {/* CARD 3: THỜI HẠN & TRẠNG THÁI */}
                            <DetailCard title="Thời hạn & Trạng thái" icon={<Calendar className="h-5 w-5 text-orange-600" />} iconClassName="bg-orange-50 text-orange-600">
                                <div className="flex flex-col gap-5 mt-2 h-full">
                                    <div className="grid grid-cols-2 gap-4">
                                    <InfoBlock label="Ngày kích hoạt" value={displayStartDate} />
                                        <InfoBlock 
                                            label="Ngày hết hạn" 
                                            value={warranty.end_date ? formatJustDate(warranty.end_date) : '---'} 
                                            valueClassName={`text-[15px] font-bold ${isExpired ? 'text-red-600' : 'text-slate-900'}`}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InfoBlock label="Ngày tiếp nhận lỗi" value={formatJustDate(warranty.created_at)} />
                                        <InfoBlock 
                                            label="Hạn" 
                                            value={
                                                daysRemaining === null ? '---' : 
                                                isExpired ? 'Đã hết hạn' : `Còn ${daysRemaining} ngày`
                                            } 
                                            valueClassName={`text-[15px] font-bold ${isExpired ? 'text-red-600' : 'text-blue-600'}`}
                                        />
                                    </div>
                                    <div className="pt-4 mt-auto border-t border-slate-100 border-dashed">
                                        <span className="block mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Trạng thái hiện tại</span>
                                        {currentStatusUI}
                                    </div>
                                </div>
                            </DetailCard>
                        </div>

                        {/* HÀNG 2: 2 CỘT (Thông tin lỗi | Ghi chú & Điều kiện) */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                            
                            {/* CARD 4: LỖI (Chiếm 2/5) */}
                            <div className="lg:col-span-2">
                                <DetailCard title="Thông tin tiếp nhận lỗi" icon={<AlertCircle className="h-5 w-5 text-red-600" />} iconClassName="bg-red-50 text-red-600 h-full" bodyClassName="justify-start">
                                    <div className="flex flex-col gap-5">
                                        <div className="flex flex-col">
                                            <span className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Lỗi khách thông báo</span>
                                            <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 text-[14px] text-red-900 font-medium leading-relaxed whitespace-pre-wrap min-h-[80px]">
                                                {customerFaultNote}
                                            </div>
                                        </div>

                                        <InfoBlock 
                                            label="Tình trạng máy khi nhận" 
                                            value={receiveStatus} 
                                            valueClassName="text-[14px] text-slate-800 leading-relaxed font-medium mt-1 whitespace-pre-wrap"
                                        />
                                        
                                        <div className="border-t border-slate-100 pt-5 mt-2 flex justify-between items-center">
                                            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">Chi phí phát sinh</span>
                                            <span className="text-lg font-black text-slate-900">{formatCurrency(warranty.cost)}</span>
                                        </div>
                                    </div>
                                </DetailCard>
                            </div>

                            {/* CARD 5: GHI CHÚ & ĐIỀU KIỆN (Chiếm 3/5) */}
                            <div className="lg:col-span-2">
                                <DetailCard title="Ghi chú & Điều kiện" icon={<FileText className="h-5 w-5 text-amber-600" />} iconClassName="bg-amber-50 text-amber-600 h-full" bodyClassName='justify-start'>
                                    <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-xl p-5 flex flex-col gap-6">
                                        
                                        <div>
                                            <h4 className="font-bold text-amber-900 mb-2 text-[14px]">Ghi chú đặc biệt:</h4>
                                            <div className="text-[14px] text-amber-800 leading-relaxed whitespace-pre-wrap">
                                                {specialNote}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-amber-900 mb-2 text-[14px]">Điều kiện bảo hành:</h4>
                                            <div className="text-[14px] text-amber-800 leading-relaxed whitespace-pre-wrap">
                                                {warrantyCondition}
                                            </div>
                                        </div>
                                        
                                    </div>
                                </DetailCard>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <EditWarrantyModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={refresh}
                warranty={warranty}
            />
        </div>
    )
}