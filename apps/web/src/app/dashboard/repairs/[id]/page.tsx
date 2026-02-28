'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Edit, Printer, User, Smartphone, Banknote, Wrench, Loader2 } from 'lucide-react'

// Hooks & Types
import { useRepairDetail } from '@/hooks/repair/useRepairDetail'
import { formatCurrency, formatDate } from '@/lib/utils'
import { parseRepairDescription } from '@/lib/repairParser' // <-- Import hàm tiện ích

// Components
import { Button } from '@/components/ui/button'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import PageBreadcrumb from '@/components/common/PageBreadcrumb'
import DetailCard from '@/components/common/detail/DetailCard'
import PageHeader from '@/components/common/detail/PageHeader'
import PageLoading from '@/components/common/PageLoading'
import RepairStatusBadge from '@/components/common/badges/RepairStatusBadge'
import EditRepairModal from '@/components/phones/repairs/EditRepairModal'
import { useToast } from '@/hooks/use-toast'
import { repairService } from '@/services/repair.service'

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
    <div className={`flex flex-col ${className}`}>
        <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
        </span>
        <div className={valueClassName}>{value || '---'}</div>
    </div>
)

export default function RepairDetailPage() {
    const { id } = useParams()
    const { repair, isLoading, refresh } = useRepairDetail(Number(id))
    const { toast } = useToast()
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const router = useRouter()
    const [isCompleting, setIsCompleting] = useState(false)

    if (isLoading) return <PageLoading title="Chi tiết sửa chữa" />
    if (!repair) return null

    // --- SỬ DỤNG HÀM TIỆN ÍCH ĐỂ BÓC TÁCH ---
    const parsedData = parseRepairDescription(
        repair.description,
        repair.device_name,
        repair.part_cost ? Number(repair.part_cost) : 0
    )

    // Tính toán chi phí
    const repairPrice = repair.repair_price ? Number(repair.repair_price) : 0
    const totalPartCost = parsedData.parts.reduce((sum, p) => sum + Number(p.price), 0)
    const totalCost = totalPartCost + repairPrice

    const isLocked = repair.status === 'COMPLETED'

    const handleCompleteAndPrint = async () => {
        try {
            setIsCompleting(true)
            const res = await repairService.complete(repair.id)
            
            toast({ title: 'Thành công', description: 'Đã chốt hoá đơn sửa chữa!' })
            
            // Redirect sang trang chi tiết hoá đơn để in
            if (res.invoice_id) {
                router.push(`/dashboard/invoices/${res.invoice_id}`)
            }
        } catch (error: any) {
            toast({ 
                variant: 'destructive', 
                title: 'Lỗi', 
                description: error.response?.data?.error || 'Không thể xuất hoá đơn.' 
            })
        } finally {
            setIsCompleting(false)
        }
    }

    return (
        <div className="flex h-full flex-col bg-[#f8fafc]">
            <DashboardHeader title="Chi tiết sửa chữa" />

            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
                    {/* 1. BREADCRUMB */}
                    <PageBreadcrumb
                        items={[
                            { label: 'Trang chủ', href: '/dashboard' },
                            { label: 'Sửa chữa', href: '/dashboard/repairs' },
                            { label: 'Chi tiết sửa chữa' },
                        ]}
                    />

                    {/* 2. HEADER */}
                    <PageHeader
                        title={repair.customer_name || 'Khách lẻ'}
                        status={<RepairStatusBadge status={repair.status} />}
                        subtitle={
                            <>
                                Mã phiếu:{' '}
                                <span className="font-mono font-semibold text-slate-700">
                                    #REP-{String(repair.id).padStart(6, '0')}
                                </span>
                                <span className="mx-2 text-slate-300">•</span>
                                Ngày nhận: {formatDate(repair.created_at)}
                            </>
                        }
                        actions={
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditModalOpen(true)}
                                    disabled={isLocked} // Khoá nút Sửa khi hoàn thành
                                    className={`gap-2 border-slate-300 bg-white shadow-sm ${
                                        isLocked 
                                        ? 'opacity-50 cursor-not-allowed text-slate-400' 
                                        : 'text-slate-700 hover:border-primary hover:text-primary'
                                    }`}
                                >
                                    <Edit className="h-4 w-4" />
                                    <span>{isLocked ? 'Đã chốt phiếu' : 'Sửa thông tin'}</span>
                                </Button>
                                <Button 
                                    disabled={!isLocked || isCompleting} // Mở nút in khi hoàn thành
                                    onClick={handleCompleteAndPrint}
                                    className={`gap-2 text-white shadow-md transition-all font-semibold px-6 ${
                                        isLocked 
                                        ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' 
                                        : 'bg-slate-300 cursor-not-allowed shadow-none'
                                    }`}
                                >
                                    {isCompleting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Printer className="h-4 w-4" />
                                    )}
                                    <span>
                                        {isCompleting ? 'Đang tạo HD...' : 'Hoàn thành & In hoá đơn'}
                                    </span>
                                </Button>
                            </>
                        }
                    />

                    {/* 3. INFO GRIDS */}
                    <div className="mt-2 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        
                        {/* CARD 1: KHÁCH HÀNG */}
                        <DetailCard title="Thông tin khách hàng" icon={<User className="h-5 w-5 text-blue-600" />}>
                            <div className="flex flex-col gap-5">
                                <InfoBlock label="Họ và tên" value={repair.customer_name} />
                                <InfoBlock label="Số điện thoại" value={repair.customer_phone} valueClassName="text-base text-slate-900 font-medium tracking-wide" />
                                <InfoBlock label="Địa chỉ" value="---" />
                            </div>
                        </DetailCard>

                        {/* CARD 2: THIẾT BỊ */}
                        <DetailCard title="Thông tin thiết bị" icon={<Smartphone className="h-5 w-5 text-indigo-600" />} iconClassName="bg-indigo-50">
                            <div className="flex flex-col gap-5">
                                <InfoBlock label="Đời máy" value={parsedData.deviceName} valueClassName="text-lg text-slate-900 font-bold" />
                                <div className="grid grid-cols-2 gap-5">
                                    <InfoBlock label="IMEI/Serial" value={parsedData.imei ? <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-sm text-slate-700">{parsedData.imei}</span> : '---'} />
                                    <InfoBlock label="Màu sắc" value={parsedData.color ? <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-800"></div><span>{parsedData.color}</span></div> : '---'} />
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <InfoBlock label="Mật khẩu" value={repair.device_password ? <span className="text-red-500 font-mono bg-red-50 px-2 py-0.5 rounded">{repair.device_password}</span> : 'Không có'} />
                                    <InfoBlock label="Linh kiện kèm" value={parsedData.accessories} />
                                </div>
                            </div>
                        </DetailCard>

                        {/* CARD 3: CHI TIẾT SỬA CHỮA */}
                        <DetailCard title="Chi tiết sửa chữa" icon={<Wrench className="h-5 w-5 text-blue-600" />} iconClassName="bg-blue-50">
                            <div className="flex flex-col gap-6">
                                <InfoBlock
                                    label="Mô tả lỗi"
                                    value={
                                        <div className="mt-1 min-h-[80px] whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50/50 p-4 text-sm leading-relaxed text-slate-700">
                                            {parsedData.mainError || 'Không có mô tả lỗi.'}
                                        </div>
                                    }
                                />
                                <div className="grid grid-cols-2 gap-5">
                                    <InfoBlock label="Ngày nhận" value={formatDate(repair.created_at)} />
                                    <InfoBlock label="Hẹn trả máy" valueClassName="text-blue-600 font-bold" value={parsedData.appointmentDate} />
                                </div>
                                <InfoBlock
                                    label="Ghi chú kỹ thuật"
                                    value={
                                        <div className="mt-1 min-h-[60px] whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
                                            {parsedData.technicalNote || '---'}
                                        </div>
                                    } 
                                />
                            </div>
                        </DetailCard>

                        {/* CARD 4: CHI PHÍ & LINH KIỆN */}
                        <DetailCard title="Chi phí & Linh kiện" icon={<Banknote className="h-5 w-5 text-green-600" />} iconClassName="bg-green-50">
                            <div className="flex h-full flex-col justify-between">
                                <div className="flex flex-col divide-y divide-slate-50 border-b border-slate-100 pb-2">
                                    
                                    {/* MẢNG LINH KIỆN ĐỘNG */}
                                    {parsedData.parts.map((p, idx) => (
                                        <div key={idx} className="flex justify-between items-start py-3.5 whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50/50 p-4 mb-3">
                                            <div className="flex flex-col">
                                                <span className="text-slate-800 font-semibold">{p.name}</span>
                                                <span className="text-[13px] text-slate-400 mt-0.5">
                                                    Hạn BH: {p.warranty > 0 ? `${p.warranty} tháng` : 'Không bảo hành'}
                                                </span>
                                            </div>
                                            <span className="font-bold text-slate-900">{formatCurrency(p.price)}</span>
                                        </div>
                                    ))}

                                    <div className="flex justify-between items-start py-3.5 whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50/50 p-4 mb-3">
                                        <div className="flex flex-col">
                                            <span className="text-slate-800 font-semibold">Tiền công thợ</span>
                                            <span className="text-[13px] text-slate-400 mt-0.5">Bảo hành dịch vụ 7 ngày</span>
                                        </div>
                                        <span className="font-bold text-slate-900">{formatCurrency(repairPrice)}</span>
                                    </div>

                                    <div className="flex justify-between items-start py-3.5 opacity-50 whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50/50 p-4 mb-3">
                                        <div className="flex flex-col">
                                            <span className="text-slate-500 font-medium">Giảm giá</span>
                                        </div>
                                        <span className="font-bold text-slate-500">- 0 ₫</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-2 flex justify-between items-center">
                                    <span className="text-[15px] font-bold text-slate-800">Tổng cộng</span>
                                    <span className="text-2xl font-black text-blue-600">{formatCurrency(totalCost)}</span>
                                </div>
                            </div>
                        </DetailCard>
                    </div>
                </div>
            </div>

            <EditRepairModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={refresh}
                repair={repair}
            />
        </div>
    )
}