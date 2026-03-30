'use client'

import { useEffect, useState, useRef } from 'react'
import { X, Printer, Download, Store, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogClose, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useReactToPrint } from 'react-to-print'
import { formatCurrency, formatDate } from '@/lib/utils'
import { repairService } from '@/services/repair.service'
import { Repair } from '@/types/repair'

interface Props {
    isOpen: boolean
    onClose: () => void
    repairId: number
}

export default function RepairPreviewModal({ isOpen, onClose, repairId }: Props) {
    const [repair, setRepair] = useState<Repair | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()

    const printRef = useRef<HTMLDivElement>(null)

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Phieu_Hen_${repair?.id || 'moi'}`,
    })

    // FETCH DATA
    useEffect(() => {
        if (isOpen && repairId) {
            const fetchRepair = async () => {
                try {
                    setIsLoading(true)
                    const data = await repairService.getDetail(repairId)
                    setRepair(data)
                } catch (error) {
                    toast({
                        variant: 'destructive',
                        title: 'Lỗi',
                        description: 'Không thể tải thông tin phiếu sửa chữa',
                    })
                } finally {
                    setIsLoading(false)
                }
            }
            fetchRepair()
        }
    }, [isOpen, repairId, toast])

    if (!isOpen) return null

    // Tính toán lại tổng tiền dự kiến
    const partCost = repair?.part_cost || 0
    const repairCost = repair?.repair_price || 0
    const discount = repair?.description_json?.discount || 0
    const totalEstimate = partCost + repairCost - discount

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="flex h-full max-h-screen w-full max-w-[1400px] items-center justify-center border-none bg-transparent p-0 shadow-none">
                <DialogTitle className="sr-only">In Phiếu Hẹn</DialogTitle>
                <DialogClose className="fixed right-6 top-6 z-[60] rounded-full p-2 text-white/80 transition-all hover:bg-white/10 hover:text-white">
                    <X className="h-8 w-8" />
                </DialogClose>

                <div className="relative flex h-[90vh] w-full flex-col items-start justify-center gap-8 px-4 lg:flex-row">
                    <div className="h-full w-full max-w-[800px] overflow-y-auto rounded-lg bg-white shadow-2xl">
                        {isLoading || !repair ? (
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
                                        <h2 className="mb-2 text-2xl font-bold uppercase text-slate-900">Phiếu Tiếp Nhận Máy</h2>
                                        <p className="font-medium text-slate-500">
                                            Mã Phiếu: <span className="font-mono text-slate-900">REP-{repair.id}</span>
                                        </p>
                                        <p className="text-slate-500">Ngày lập: {formatDate(repair.created_at)}</p>
                                        {repair.description_json?.promised_return_date && (
                                            <p className="font-bold text-slate-800 mt-1">Hẹn trả: {formatDate(repair.description_json.promised_return_date)}</p>
                                        )}
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
                                                <span className="text-base font-semibold text-slate-800">{repair.customer_name || '---'}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-bold uppercase text-slate-400">Số điện thoại</span>
                                                <span className="text-base font-semibold text-slate-800">{repair.customer_phone || '---'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="mb-5 border-b border-slate-200 pb-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                                            Thông tin thiết bị
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <span className="block text-xs font-bold uppercase text-slate-400">Tên máy</span>
                                                <span className="text-base font-semibold text-slate-800">{repair.device_name || repair.description_json?.device_name || '---'}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="block text-xs font-bold uppercase text-slate-400">Màu sắc</span>
                                                    <span className="text-base font-medium text-slate-800">{repair.description_json?.color || '---'}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-xs font-bold uppercase text-slate-400">IMEI</span>
                                                    <span className="font-mono text-sm font-medium text-slate-800">{repair.description_json?.imei || '---'}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-bold uppercase text-slate-400">Phụ kiện kèm theo</span>
                                                <span className="text-base font-medium text-slate-800">{repair.description_json?.accessories || 'Không có'}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-bold uppercase text-slate-400">Tình trạng lỗi (Khách báo)</span>
                                                <span className="text-base font-medium text-slate-800 whitespace-pre-wrap">{repair.description_json?.fault || '---'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Báo giá dự kiến */}
                                <div className="mb-10 flex-1">
                                    <h3 className="mb-5 border-b border-slate-200 pb-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                                        Chi phí dự kiến (Chưa bao gồm phát sinh)
                                    </h3>
                                    
                                    <div className="overflow-hidden rounded-lg border border-slate-200">
                                        <table className="w-full border-collapse text-left">
                                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                                {/* Danh sách linh kiện */}
                                                {repair.description_json?.parts && repair.description_json.parts.map((part, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-4 font-semibold text-slate-900">Thay/Đổi: {part.name}</td>
                                                        <td className="px-4 py-4 text-right text-slate-900">{formatCurrency(part.price)}</td>
                                                    </tr>
                                                ))}
                                                {/* Tiền công */}
                                                {repair.repair_price !== undefined && repair.repair_price > 0 && (
                                                    <tr>
                                                        <td className="px-4 py-4 font-semibold text-slate-900">Tiền công thợ / Dịch vụ</td>
                                                        <td className="px-4 py-4 text-right text-slate-900">{formatCurrency(repair.repair_price)}</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Tổng tiền & Lưu ý */}
                                <div className="mb-20 grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="text-xs text-slate-500 italic">
                                        * Lưu ý: Đây là chi phí ước tính dựa trên tình trạng ban đầu. Nếu có phát sinh thêm lỗi trong quá trình sửa chữa, chúng tôi sẽ liên hệ báo giá trước khi tiến hành. <br />
                                        * Quý khách vui lòng mang theo phiếu này khi đến nhận máy.
                                    </div>
                                    <div className="flex w-full flex-col gap-2 border-t-2 border-slate-800 py-4">
                                        {discount > 0 && (
                                            <div className="flex items-center justify-between text-slate-500">
                                                <span className="font-semibold uppercase">Giảm giá</span>
                                                <span className="font-medium">- {formatCurrency(discount)}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-lg font-bold uppercase text-slate-700">Tổng thu dự kiến</span>
                                            <span className="text-3xl font-bold tracking-tight text-slate-900">{formatCurrency(totalEstimate)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Chữ ký */}
                                <div className="mt-auto flex break-inside-avoid justify-between px-8 pb-10">
                                    <div className="text-center">
                                        <p className="mb-16 text-sm font-bold uppercase text-slate-500">Khách hàng</p>
                                        <p className="text-lg font-bold text-slate-900">{repair.customer_name || ''}</p>
                                        <p className="mt-1 text-xs italic text-slate-400">(Ký và ghi rõ họ tên)</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="mb-16 text-sm font-bold uppercase text-slate-500">Kỹ thuật viên / Kế toán</p>
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
                                    <Printer className="h-5 w-5" /> In phiếu hẹn
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