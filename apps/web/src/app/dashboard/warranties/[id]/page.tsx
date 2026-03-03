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

// --- HÀM BÓC TÁCH DỮ LIỆU ---
const parseDescription = (desc?: string) => {
    if (!desc) return { receiveStatus: 'Không có ghi chú.', customerFaultNote: 'Không có mô tả lỗi.' }
    // Nếu là data cũ không có format tag
    if (!desc.includes('[Tình trạng máy khi nhận]')) return { receiveStatus: '---', customerFaultNote: desc }

    const parts = desc.split('\n\n[Lỗi khách thông báo]\n')
    const receiveStatus = parts[0].replace('[Tình trạng máy khi nhận]\n', '').trim()
    const customerFaultNote = parts[1] ? parts[1].trim() : 'Không có mô tả lỗi.'
    
    return { receiveStatus, customerFaultNote }
}

const parseTechnicalNote = (note?: string) => {
    if (!note) return { specialNote: 'Không có', warrantyCondition: 'Theo quy định chuẩn' }
    // Nếu là data cũ không có format tag
    if (!note.includes('[Ghi chú đặc biệt]')) return { specialNote: note, warrantyCondition: 'Theo quy định chuẩn' }

    const parts = note.split('\n\n[Điều kiện bảo hành]\n')
    const specialNote = parts[0].replace('[Ghi chú đặc biệt]\n', '').trim()
    const warrantyCondition = parts[1] ? parts[1].trim() : 'Theo quy định chuẩn'
    
    return { specialNote, warrantyCondition }
}

export default function WarrantyDetailPage() {
    const { id } = useParams()
    const { warranty, isLoading, daysRemaining, isExpired } = useWarrantyDetail(Number(id))
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    if (isLoading) return <PageLoading title="Chi tiết tiếp nhận bảo hành" />
    if (!warranty) return null

    const isSale = warranty.type === 'SALE'

    // Áp dụng bóc tách dữ liệu
    const { receiveStatus, customerFaultNote } = parseDescription(warranty.description)
    const { specialNote, warrantyCondition } = parseTechnicalNote(warranty.technical_note)

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
                                    {warranty.invoice_code || `#${warranty.invoice_id}`}
                                </Link>
                            </div>
                        }
                        actions={
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="gap-2 border-slate-300 bg-white shadow-sm text-slate-700 hover:border-primary hover:text-primary font-semibold"
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
                                    <InfoBlock label="Họ và tên" value={warranty.customer_name} />
                                    <InfoBlock 
                                        label="Số điện thoại" 
                                        value={warranty.customer_phone} 
                                        allowCopy 
                                        copyValue={warranty.customer_phone || ''} 
                                    />
                                    <InfoBlock label="CCCD" value="---" /> {/* DB chưa kéo lên, để mockup */}
                                </div>
                            </DetailCard>

                            {/* CARD 2: THIẾT BỊ */}
                            <DetailCard title="Thông tin thiết bị" icon={<Smartphone className="h-5 w-5 text-purple-600" />} iconClassName="bg-purple-50 text-purple-600">
                                <div className="flex flex-col gap-6 mt-2">
                                    <InfoBlock label="Đời máy" value={warranty.device_name} />
                                    <InfoBlock 
                                        label="IMEI" 
                                        value={<span className="font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100">{warranty.imei || '---'}</span>} 
                                        allowCopy 
                                        copyValue={warranty.imei || ''}
                                    />
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
                                        <InfoBlock label="Ngày kích hoạt" value={formatJustDate(warranty.start_date)} />
                                        <InfoBlock 
                                            label="Ngày hết hạn" 
                                            value={formatJustDate(warranty.end_date)} 
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
                                        <span className="block mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Trạng thái hiện tại</span>
                                        <div className="flex items-center gap-2 text-emerald-600 font-bold">
                                            <CheckCircle2 className="h-5 w-5" />
                                            Đang được bảo hành
                                        </div>
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
                                        <InfoBlock 
                                            label="Tình trạng máy khi nhận" 
                                            value={receiveStatus} 
                                            valueClassName="text-[14px] text-slate-800 leading-relaxed font-medium mt-1 whitespace-pre-wrap"
                                        />
                                        <div className="flex flex-col">
                                            <span className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Lỗi khách thông báo</span>
                                            <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 text-[14px] text-red-900 font-medium leading-relaxed whitespace-pre-wrap min-h-[80px]">
                                                {customerFaultNote}
                                            </div>
                                        </div>
                                        
                                        {/* THÊM CHI PHÍ PHÁT SINH THEO MOCKUP */}
                                        <div className="border-t border-slate-100 pt-4 mt-1">
                                            <InfoBlock 
                                                label="Chi phí phát sinh" 
                                                value={formatCurrency(warranty.cost)} 
                                                valueClassName="text-[15px] font-bold text-slate-900 mt-1"
                                            />
                                        </div>
                                    </div>
                                </DetailCard>
                            </div>

                            {/* CARD 5: GHI CHÚ & ĐIỀU KIỆN (Chiếm 3/5) */}
                            <div className="lg:col-span-2">
                                <DetailCard title="Ghi chú & Điều kiện" icon={<FileText className="h-5 w-5 text-amber-600" />} iconClassName="bg-amber-50 text-amber-600 h-full" bodyClassName='justify-start'>
                                    <div className="flex flex-col gap-5 mt-2">
                                        {/* Block Ghi chú đặc biệt */}
                                        <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-xl p-5">
                                            <h4 className="font-bold text-amber-900 mb-2 text-sm">Ghi chú đặc biệt:</h4>
                                            <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-wrap">
                                                {specialNote}
                                            </p>
                                        </div>

                                        {/* Block Điều kiện tĩnh / động do nhân viên nhập */}
                                        <div className="p-2">
                                            <h4 className="font-bold text-slate-800 mb-3 text-sm">Điều kiện bảo hành:</h4>
                                            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
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
        </div>
    )
}