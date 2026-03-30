'use client'

import { useEffect, useState, useRef } from 'react'
import { X, Printer, Download, Store, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogClose, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useReactToPrint } from 'react-to-print'
import { formatCurrency, formatDate } from '@/lib/utils'
import { warrantyService } from '@/services/warranty.service'
import { Warranty } from '@/types/warranty'

interface Props {
    isOpen: boolean
    onClose: () => void
    warrantyId: number
}

export default function WarrantyPreviewModal({ isOpen, onClose, warrantyId }: Props) {
    const [warranty, setWarranty] = useState<Warranty | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()

    const printRef = useRef<HTMLDivElement>(null)

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Phieu_Bao_Hanh_${warranty?.id || 'moi'}`,
    })

    useEffect(() => {
        if (isOpen && warrantyId) {
            const fetchWarranty = async () => {
                try {
                    setIsLoading(true)
                    const data = await warrantyService.getDetail(warrantyId)
                    setWarranty(data)
                } catch (error) {
                    toast({
                        variant: 'destructive',
                        title: 'Lỗi',
                        description: 'Không thể tải thông tin phiếu bảo hành',
                    })
                } finally {
                    setIsLoading(false)
                }
            }
            fetchWarranty()
        }
    }, [isOpen, warrantyId, toast])

    if (!isOpen) return null

    const jsonDesc = warranty?.description_json || {}
    const jsonNote = warranty?.technical_note_json || {}

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="flex h-full max-h-screen w-full max-w-[1400px] items-center justify-center border-none bg-transparent p-0 shadow-none">
                <DialogTitle className="sr-only">In Phiếu Bảo Hành</DialogTitle>
                <DialogClose className="fixed right-6 top-6 z-[60] rounded-full p-2 text-white/80 transition-all hover:bg-white/10 hover:text-white">
                    <X className="h-8 w-8" />
                </DialogClose>

                <div className="relative flex h-[90vh] w-full flex-col items-start justify-center gap-8 px-4 lg:flex-row">
                    <div className="h-full w-full max-w-[800px] overflow-y-auto rounded-lg bg-white shadow-2xl">
                        {isLoading || !warranty ? (
                            <div className="flex h-full items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div ref={printRef} className="flex min-h-[1100px] flex-col bg-white p-10 text-sm text-slate-800 md:p-14">
                                {/* Header */}
                                <div className="mb-10 flex flex-col items-start justify-between gap-6 border-b-2 border-slate-800 pb-8 sm:flex-row">
                                    <div className="flex items-center gap-4">
                                        <div className="flex size-16 flex-none items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
                                            <Store className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <h1 className="mb-2 text-2xl font-bold uppercase leading-none tracking-wide text-slate-900">ShopManager</h1>
                                            <p className="text-sm text-slate-500">123 Đường Nguyễn Văn Cừ, Q.5, TP.HCM</p>
                                            <p className="text-sm text-slate-500">Hotline: 1900 1234</p>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <h2 className="mb-2 text-2xl font-bold uppercase text-slate-900">Phiếu Tiếp Nhận Bảo Hành</h2>
                                        <p className="font-medium text-slate-500">
                                            Mã Phiếu: <span className="font-mono text-slate-900">BH-{warranty.id}</span>
                                        </p>
                                        <p className="text-slate-500">Ngày lập: {formatDate(warranty.created_at)}</p>
                                    </div>
                                </div>

                                {/* Thông tin khách hàng & Thiết bị */}
                                <div className="mb-10 grid grid-cols-1 gap-10 md:grid-cols-2">
                                    <div>
                                        <h3 className="mb-5 border-b border-slate-200 pb-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                                            Thông tin khách hàng
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <span className="block text-xs font-bold uppercase text-slate-400">Họ tên</span>
                                                <span className="text-base font-semibold text-slate-800">{warranty.customer_name || '---'}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-bold uppercase text-slate-400">Số điện thoại</span>
                                                <span className="text-base font-semibold text-slate-800">{warranty.customer_phone || '---'}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-bold uppercase text-slate-400">CCCD/CMND</span>
                                                <span className="text-base font-semibold text-slate-800">{warranty.customer_id_number || '---'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="mb-5 border-b border-slate-200 pb-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                                            Thông tin thiết bị
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <span className="block text-xs font-bold uppercase text-slate-400">Đời máy / Sản phẩm</span>
                                                <span className="text-base font-semibold text-slate-800">{warranty.device_name || '---'}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="block text-xs font-bold uppercase text-slate-400">IMEI</span>
                                                    <span className="font-mono text-sm font-medium text-slate-800">{warranty.imei || '---'}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-xs font-bold uppercase text-slate-400">Hóa đơn gốc</span>
                                                    <span className="font-mono text-sm font-medium text-slate-800">{warranty.invoice_code || '---'}</span>
                                                </div>
                                            </div>
                                            {jsonDesc.part_name && (
                                                <div>
                                                    <span className="block text-xs font-bold uppercase text-slate-400">Linh kiện bảo hành</span>
                                                    <span className="text-base font-medium text-slate-800">{jsonDesc.part_name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Thông tin tình trạng lỗi */}
                                <div className="mb-10">
                                    <h3 className="mb-5 border-b border-slate-200 pb-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                                        Chi tiết tiếp nhận
                                    </h3>
                                    <div className="grid grid-cols-1 gap-6 border border-slate-200 rounded-lg p-5 bg-slate-50/50">
                                        <div>
                                            <span className="block text-xs font-bold uppercase text-slate-400 mb-1">Lỗi khách báo</span>
                                            <span className="text-base font-medium text-slate-800 whitespace-pre-wrap">{jsonDesc.fault || warranty.description || '---'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold uppercase text-slate-400 mb-1">Tình trạng máy khi nhận</span>
                                            <span className="text-base font-medium text-slate-800 whitespace-pre-wrap">{jsonDesc.condition || '---'}</span>
                                        </div>
                                        {warranty.cost > 0 && (
                                            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                                                <span className="block text-sm font-bold uppercase text-slate-700">Chi phí phát sinh dự kiến:</span>
                                                <span className="text-lg font-bold text-red-600">{formatCurrency(warranty.cost)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Điều kiện bảo hành & Ghi chú */}
                                <div className="mb-20">
                                    <div className="text-xs text-slate-500 leading-relaxed space-y-3">
                                        <p><span className="font-bold">Ghi chú đặc biệt:</span> {jsonNote.special_note || 'Không có'}</p>
                                        <p><span className="font-bold">Điều kiện bảo hành:</span> {jsonNote.warranty_condition || 'Theo chính sách chung của cửa hàng.'}</p>
                                        <p className="italic mt-4 text-slate-400">* Quý khách vui lòng mang theo phiếu này khi đến nhận lại máy. Cửa hàng không chịu trách nhiệm về dữ liệu cá nhân trong quá trình bảo hành/sửa chữa.</p>
                                    </div>
                                </div>

                                {/* Chữ ký */}
                                <div className="mt-auto flex break-inside-avoid justify-between px-8 pb-10">
                                    <div className="text-center">
                                        <p className="mb-16 text-sm font-bold uppercase text-slate-500">Khách hàng</p>
                                        <p className="text-lg font-bold text-slate-900">{warranty.customer_name || ''}</p>
                                        <p className="mt-1 text-xs italic text-slate-400">(Ký và ghi rõ họ tên)</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="mb-16 text-sm font-bold uppercase text-slate-500">Người tiếp nhận</p>
                                        <p className="text-lg font-bold text-slate-900">Admin</p>
                                        <p className="mt-1 text-xs italic text-slate-400">(Ký và ghi rõ họ tên)</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar tác vụ */}
                    <div className="sticky top-0 order-first flex w-full flex-none flex-col gap-4 lg:order-last lg:w-48">
                        <div className="rounded-xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-md">
                            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white opacity-80">Tác vụ</h4>
                            <div className="flex flex-col gap-3">
                                <Button onClick={handlePrint} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-6 font-semibold text-white shadow-lg hover:bg-blue-600">
                                    <Printer className="h-5 w-5" /> In phiếu
                                </Button>
                                <Button className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/40 bg-transparent py-6 font-semibold text-white shadow-sm hover:border-white hover:bg-white hover:text-primary">
                                    <Download className="h-5 w-5" /> Tải PDF
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}