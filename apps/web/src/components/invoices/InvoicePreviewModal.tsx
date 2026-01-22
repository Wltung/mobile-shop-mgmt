'use client'

import { useEffect, useState, useRef } from 'react'
import { X, Printer, Download, Store } from 'lucide-react'
import { Dialog, DialogContent, DialogClose, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { invoiceService } from '@/services/invoice.service'
import { Invoice } from '@/types/invoice'
import { Phone } from '@/types/phone'
import { useToast } from '@/hooks/use-toast'
// Thư viện in ấn (nếu muốn in xịn hơn window.print)
import { useReactToPrint } from 'react-to-print'

interface Props {
    isOpen: boolean
    onClose: () => void
    phone: Phone // Dữ liệu máy để hiển thị thông tin người bán/sản phẩm
    invoiceId: number // ID hóa đơn để fetch chi tiết (mã hóa đơn, ngày lập...)
}

export default function InvoicePreviewModal({ isOpen, onClose, phone, invoiceId }: Props) {
    const [invoice, setInvoice] = useState<Invoice | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()
    
    // Ref cho chức năng in
    const printRef = useRef<HTMLDivElement>(null)

    // Hàm in
    const handlePrint = useReactToPrint({
        contentRef: printRef, // Dùng contentRef và truyền biến ref trực tiếp (không dùng .current)
        documentTitle: `Hoa_don_${invoice?.invoice_code || 'nhap_may'}`,
        onAfterPrint: () => {
            // Tùy chọn: Log hoặc thông báo sau khi in xong
            console.log('In thành công')
        }
    })

    useEffect(() => {
        if (isOpen && invoiceId) {
            const fetchInvoice = async () => {
                try {
                    setIsLoading(true)
                    const data = await invoiceService.getDetail(invoiceId)
                    setInvoice(data)
                } catch (error) {
                    toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể tải thông tin hoá đơn' })
                } finally {
                    setIsLoading(false)
                }
            }
            fetchInvoice()
        }
    }, [isOpen, invoiceId])

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)

    const formatDate = (val?: string) => 
        val ? new Date(val).toLocaleDateString('vi-VN') : '---'

    if (!isOpen) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[1400px] w-full h-full max-h-screen p-0 bg-transparent border-none shadow-none flex items-center justify-center">
                <DialogTitle className="sr-only">
                    Xem trước hoá đơn nhập hàng
                </DialogTitle>

                {/* Nút đóng */}
                <DialogClose className="fixed top-6 right-6 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all z-[60]">
                    <X className="h-8 w-8" />
                </DialogClose>

                <div className="relative flex flex-col lg:flex-row gap-8 items-start justify-center w-full px-4 h-[90vh]">
                    
                    {/* --- KHUNG HOÁ ĐƠN (Phần sẽ in) --- */}
                    <div className="bg-white w-full max-w-[800px] shadow-2xl overflow-y-auto h-full rounded-lg">
                        {isLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div ref={printRef} className="p-10 md:p-14 flex flex-col text-slate-800 text-sm min-h-[1100px] bg-white">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-800 pb-8 mb-10 gap-6">
                                    <div className="flex gap-4 items-center">
                                        <div className="size-16 bg-slate-900 rounded-lg flex-none flex items-center justify-center text-white shadow-sm">
                                            <Store className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <h1 className="font-bold text-2xl uppercase tracking-wide text-slate-900 leading-none mb-2">ShopManager</h1>
                                            <p className="text-slate-500 text-sm">123 Đường Nguyễn Văn Cừ, Q.5, TP.HCM</p>
                                            <p className="text-slate-500 text-sm">Hotline: 1900 1234</p>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <h2 className="font-bold text-2xl uppercase text-slate-900 mb-2">Hoá Đơn Nhập Máy</h2>
                                        <p className="text-slate-500 font-medium">Mã số: <span className="font-mono text-slate-900">{invoice?.invoice_code}</span></p>
                                        <p className="text-slate-500">Ngày: {formatDate(invoice?.created_at)}</p>
                                    </div>
                                </div>

                                {/* Thông tin người bán */}
                                <div className="mb-10">
                                    <h3 className="font-bold text-sm border-b border-slate-200 pb-2 mb-5 uppercase tracking-wider text-slate-500">Thông tin người bán</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <span className="block text-slate-400 text-xs uppercase font-bold mb-1">Họ tên</span>
                                            <span className="font-semibold text-lg text-slate-800">{phone.seller_name || 'Khách vãng lai'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-slate-400 text-xs uppercase font-bold mb-1">Số điện thoại</span>
                                            <span className="font-semibold text-lg text-slate-800">{phone.seller_phone || '---'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-slate-400 text-xs uppercase font-bold mb-1">Số CCCD</span>
                                            <span className="font-semibold text-lg text-slate-800">{phone.seller_id || '---'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bảng sản phẩm */}
                                <div className="mb-10 flex-1">
                                    <h3 className="font-bold text-sm border-b border-slate-200 pb-2 mb-5 uppercase tracking-wider text-slate-500">Chi tiết sản phẩm</h3>
                                    <div className="overflow-hidden rounded-lg border border-slate-200">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                                                    <th className="py-3 px-4 font-bold w-16 text-center">STT</th>
                                                    <th className="py-3 px-4 font-bold">Đời máy</th>
                                                    <th className="py-3 px-4 font-bold">IMEI</th>
                                                    <th className="py-3 px-4 font-bold text-center">SL</th>
                                                    <th className="py-3 px-4 font-bold text-right">Đơn giá</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-slate-700 divide-y divide-slate-100">
                                                <tr>
                                                    <td className="py-4 px-4 text-center text-slate-500">1</td>
                                                    <td className="py-4 px-4 font-semibold text-slate-900">{phone.model_name}</td>
                                                    <td className="py-4 px-4 font-mono text-xs">{phone.imei}</td>
                                                    <td className="py-4 px-4 text-center text-slate-900">1</td>
                                                    <td className="py-4 px-4 text-right font-bold text-slate-900">{formatCurrency(phone.purchase_price)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Tổng tiền */}
                                <div className="flex justify-end mb-20">
                                    <div className="w-full md:w-1/2 flex justify-between items-center py-4 border-t-2 border-slate-800">
                                        <span className="font-bold text-lg uppercase text-slate-700">Tổng thanh toán</span>
                                        <span className="font-bold text-3xl text-slate-900 tracking-tight">{formatCurrency(phone.purchase_price)}</span>
                                    </div>
                                </div>

                                {/* Chữ ký */}
                                <div className="flex justify-between mt-auto px-8 pb-10 break-inside-avoid">
                                    <div className="text-center">
                                        <p className="font-bold uppercase text-sm text-slate-500 mb-16">Người bán</p>
                                        <p className="font-bold text-slate-900 text-lg">{phone.seller_name}</p>
                                        <p className="text-xs text-slate-400 italic mt-1">(Ký và ghi rõ họ tên)</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold uppercase text-sm text-slate-500 mb-16">Người lập phiếu</p>
                                        {/* Tên người lập lấy từ User Context hoặc từ API Invoice detail nếu có */}
                                        <p className="font-bold text-slate-900 text-lg">{invoice?.creator_name || 'Admin'}</p>
                                        <p className="text-xs text-slate-400 italic mt-1">(Ký và ghi rõ họ tên)</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- SIDEBAR TÁC VỤ --- */}
                    <div className="flex flex-col gap-4 sticky top-0 w-full lg:w-48 flex-none order-first lg:order-last">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-xl">
                            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide opacity-80">Tác vụ</h4>
                            <div className="flex flex-col gap-3">
                                <Button 
                                    onClick={handlePrint}
                                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white py-6 rounded-lg shadow-lg font-semibold"
                                >
                                    <Printer className="h-5 w-5" />
                                    In hoá đơn
                                </Button>
                                <Button 
                                    className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-white text-white hover:text-primary border border-white/40 hover:border-white py-6 rounded-lg shadow-sm font-semibold"
                                >
                                    <Download className="h-5 w-5" />
                                    Tải PDF
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}