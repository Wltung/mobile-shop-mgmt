'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
    ArrowLeft, Printer, Edit, Smartphone, 
    Download, FileText, Loader2 
} from 'lucide-react'

import { phoneService } from '@/services/phone.service'
import { Phone } from '@/types/phone'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import DashboardHeader from '@/components/dashboard/DashboardHeader' // <--- ĐÃ THÊM
import PageBreadcrumb from '@/components/common/PageBreadcrumb'

export default function PhoneDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const { toast } = useToast()

    const [phone, setPhone] = useState<Phone | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await phoneService.getDetail(Number(id))
                setPhone(data)
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Lỗi',
                    description: 'Không thể tải thông tin máy.',
                })
                // router.push('/dashboard/import') // Có thể bật lại nếu muốn auto redirect
            } finally {
                setIsLoading(false)
            }
        }

        if (id) fetchDetail()
    }, [id, router, toast])

    // Render Status Badge
    const renderStatus = (status: string) => {
        const styles: Record<string, string> = {
            IN_STOCK: 'bg-green-100 text-green-700 border-green-200',
            SOLD: 'bg-slate-100 text-slate-700 border-slate-200',
            REPAIRING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        }
        const labels: Record<string, string> = {
            IN_STOCK: 'Trong kho',
            SOLD: 'Đã bán',
            REPAIRING: 'Đang sửa',
        }
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border shadow-sm ${styles[status] || 'bg-gray-100'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mr-2 ${status === 'IN_STOCK' ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                {labels[status] || status}
            </span>
        )
    }

    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)

    const formatDate = (val: string) => new Date(val).toLocaleDateString('vi-VN')

    // --- Loading View ---
    if (isLoading) {
        return (
            <div className="flex h-screen flex-col bg-[#f8fafc]">
                <DashboardHeader title="Chi tiết máy" />
                <div className="flex flex-1 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    // --- Not Found View ---
    if (!phone) return (
         <div className="flex h-screen flex-col bg-[#f8fafc]">
            <DashboardHeader title="Chi tiết máy" />
            <div className="flex flex-1 items-center justify-center text-slate-500">
                Không tìm thấy dữ liệu máy.
            </div>
        </div>
    )

    return (
        <div className="flex h-full flex-col bg-[#f8fafc]">
            
            {/* 1. HEADER TOÀN CỤC (Giống các trang khác) */}
            <DashboardHeader title="Chi tiết máy" />

            {/* 2. NỘI DUNG CHÍNH */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                <div className="mx-auto flex h-full max-w-[1400px] flex-col gap-6">
                    
                    {/* Breadcrumb & Navigation */}
                    <PageBreadcrumb 
                        items={[
                            { label: 'Trang chủ', href: '/dashboard' },
                            { label: 'Nhập máy', href: '/dashboard/import' },
                            { label: 'Chi tiết' } // Không href = Active
                        ]} 
                    />

                    {/* Title Section (Tên máy & Buttons) */}
                    <div className="mt-2 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <div className="mb-1 flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                    {phone.model_name}
                                </h1>
                                {renderStatus(phone.status)}
                            </div>
                            <p className="font-medium text-slate-500">
                                Mã hoá đơn: #HD-2023... (ID: {phone.id})
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="gap-2 bg-white text-slate-700 shadow-sm hover:border-primary/50 hover:text-primary">
                                <Printer className="h-5 w-5" />
                                <span>In hoá đơn</span>
                            </Button>
                            <Button className="gap-2 bg-primary text-white shadow-md shadow-primary/20 hover:bg-blue-600">
                                <Edit className="h-5 w-5" />
                                <span>Sửa thông tin</span>
                            </Button>
                        </div>
                    </div>

                    {/* GRID CARDS INFO */}
                    <div className="mt-4 grid flex-1 grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                        
                        {/* CARD 1: THÔNG TIN CƠ BẢN */}
                        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                                <Smartphone className="h-5 w-5 text-blue-500" />
                                <h3 className="font-bold text-slate-900">Thông tin cơ bản</h3>
                            </div>
                            <div className="flex flex-1 flex-col justify-center space-y-6 p-6 text-sm">
                                <div className="flex items-center justify-between border-b border-dashed border-slate-100 py-2">
                                    <span className="text-base text-slate-500">IMEI</span>
                                    <span className="font-mono text-lg font-bold text-slate-800">{phone.imei}</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-dashed border-slate-100 py-2">
                                    <span className="text-base text-slate-500">Đời máy</span>
                                    <span className="text-lg font-medium text-slate-800">{phone.model_name}</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-dashed border-slate-100 py-2">
                                    <span className="text-base text-slate-500">Màu sắc</span>
                                    <span className="flex items-center gap-2 text-lg font-medium text-slate-800">
                                        <span className="h-4 w-4 rounded-full border border-slate-200 bg-slate-800 shadow-sm"></span>
                                        {phone.details?.color || '---'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b border-dashed border-slate-100 py-2">
                                    <span className="text-base text-slate-500">Dung lượng</span>
                                    <span className="text-lg font-medium text-slate-800">{phone.details?.storage || '---'}</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-dashed border-slate-100 py-2">
                                    <span className="text-base text-slate-500">Pin</span>
                                    <span className="rounded-md bg-green-50 px-3 py-1 text-lg font-bold text-green-600">
                                        {phone.details?.battery ? `${phone.details.battery}%` : '---'}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2 pt-2">
                                    <span className="text-base text-slate-500">Ngoại quan</span>
                                    <span className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-base font-medium leading-relaxed text-slate-800">
                                        {phone.details?.appearance || 'Không có mô tả'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* CARD 2: THÔNG TIN NHẬP HÀNG */}
                        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                                <Download className="h-5 w-5 text-green-600" />
                                <h3 className="font-bold text-slate-900">Thông tin nhập hàng</h3>
                            </div>
                            <div className="flex flex-1 flex-col justify-center space-y-6 p-6 text-sm">
                                <div className="flex items-center justify-between border-b border-dashed border-slate-100 py-2">
                                    <span className="text-base text-slate-500">Ngày nhập</span>
                                    <span className="text-lg font-medium text-slate-800">{formatDate(phone.created_at)}</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-dashed border-slate-100 py-2">
                                    <span className="text-base text-slate-500">Giá nhập</span>
                                    <span className="text-2xl font-bold text-red-600">{formatCurrency(phone.purchase_price)}</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-dashed border-slate-100 py-2">
                                    <span className="text-base text-slate-500">Người bán</span>
                                    <span className="text-lg font-medium text-slate-800">{phone.seller_name || 'Vãng lai'}</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-dashed border-slate-100 py-2">
                                    <span className="text-base text-slate-500">Số điện thoại</span>
                                    <a href={`tel:${phone.seller_phone}`} className="text-lg font-medium text-primary hover:underline">
                                        {phone.seller_phone || '---'}
                                    </a>
                                </div>
                                <div className="flex items-center justify-between border-b border-dashed border-slate-100 py-2">
                                    <span className="text-base text-slate-500">Số CCCD</span>
                                    <span className="font-mono text-lg font-medium text-slate-800">{phone.seller_id_number || '---'}</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-base text-slate-500">Hình thức</span>
                                    <span className="rounded-md bg-blue-50 px-3 py-1 text-lg font-medium text-blue-700">
                                        Khách lẻ bán lại
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* CARD 3: GHI CHÚ */}
                        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2 xl:col-span-1">
                            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                                <FileText className="h-5 w-5 text-amber-500" />
                                <h3 className="font-bold text-slate-900">Ghi chú chi tiết</h3>
                            </div>
                            <div className="flex flex-1 flex-col p-6">
                                <div className="relative h-full overflow-auto rounded-lg border border-amber-100 bg-amber-50/50 p-6 text-base italic leading-loose text-slate-700">
                                    <span className="absolute left-4 top-4 font-serif text-4xl text-amber-200 opacity-50">
                                        &quot;
                                    </span>
                                    <p className="indent-6">
                                        {phone.note || "Không có ghi chú nào cho máy này."}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}