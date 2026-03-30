'use client'

import { useEffect, useState, useRef } from 'react'
import { X, Printer, Download, Store, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogClose, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useReactToPrint } from 'react-to-print'
import { formatCurrency, formatDate } from '@/lib/utils'
import { invoiceService } from '@/services/invoice.service'
import { Invoice } from '@/types/invoice'

interface Props {
    isOpen: boolean
    onClose: () => void
    invoiceId: number
}

export default function InvoicePreviewModal({ isOpen, onClose, invoiceId }: Props) {
    const [invoice, setInvoice] = useState<Invoice | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()

    const printRef = useRef<HTMLDivElement>(null)

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Hoa_don_${invoice?.invoice_code || 'moi'}`,
    })

    // FETCH DATA ĐỘC LẬP TỪ INVOICE ID
    useEffect(() => {
        if (isOpen && invoiceId) {
            const fetchInvoice = async () => {
                try {
                    setIsLoading(true)
                    const data = await invoiceService.getDetail(invoiceId)
                    setInvoice(data)
                } catch (error) {
                    toast({
                        variant: 'destructive',
                        title: 'Lỗi',
                        description: 'Không thể tải thông tin hoá đơn',
                    })
                } finally {
                    setIsLoading(false)
                }
            }
            fetchInvoice()
        }
    }, [isOpen, invoiceId, toast])

    if (!isOpen) return null

    // DYNAMIC TITLE THEO LOẠI HOÁ ĐƠN
    let title = 'Hoá Đơn'
    if (invoice?.type === 'IMPORT') title = 'Hoá Đơn Nhập Máy'
    if (invoice?.type === 'SALE') title = 'Hoá Đơn Bán Hàng'
    if (invoice?.type === 'REPAIR') title = 'Hoá Đơn Sửa Chữa'

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="flex h-full max-h-screen w-full max-w-[1400px] items-center justify-center border-none bg-transparent p-0 shadow-none">
                <DialogTitle className="sr-only">In {title}</DialogTitle>
                <DialogClose className="fixed right-6 top-6 z-[60] rounded-full p-2 text-white/80 transition-all hover:bg-white/10 hover:text-white">
                    <X className="h-8 w-8" />
                </DialogClose>

                <div className="relative flex h-[90vh] w-full flex-col items-start justify-center gap-8 px-4 lg:flex-row">
                    <div className="h-full w-full max-w-[800px] overflow-y-auto rounded-lg bg-white shadow-2xl">
                        {isLoading || !invoice ? (
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
                                        <h2 className="mb-2 text-2xl font-bold uppercase text-slate-900">{title}</h2>
                                        <p className="font-medium text-slate-500">
                                            Mã số: <span className="font-mono text-slate-900">{invoice.invoice_code}</span>
                                        </p>
                                        <p className="text-slate-500">Ngày: {formatDate(invoice.created_at)}</p>
                                    </div>
                                </div>

                                {/* Thông tin khách hàng / người bán */}
                                <div className="mb-10">
                                    <h3 className="mb-5 border-b border-slate-200 pb-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                                        {invoice.type === 'IMPORT' ? 'Thông tin người bán' : 'Thông tin khách hàng'}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                        <div>
                                            <span className="mb-1 block text-xs font-bold uppercase text-slate-400">Họ tên</span>
                                            <span className="text-lg font-semibold text-slate-800">{invoice.customer_name || 'Khách vãng lai'}</span>
                                        </div>
                                        <div>
                                            <span className="mb-1 block text-xs font-bold uppercase text-slate-400">Số điện thoại</span>
                                            <span className="text-lg font-semibold text-slate-800">{invoice.customer_phone || '---'}</span>
                                        </div>
                                        <div>
                                            <span className="mb-1 block text-xs font-bold uppercase text-slate-400">Số CCCD</span>
                                            <span className="text-lg font-semibold text-slate-800">{invoice.customer_id_number || '---'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bảng sản phẩm */}
                                <div className="mb-10 flex-1">
                                    <h3 className="mb-5 border-b border-slate-200 pb-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                                        Chi tiết sản phẩm / Dịch vụ
                                    </h3>
                                    <div className="overflow-hidden rounded-lg border border-slate-200">
                                        <table className="w-full border-collapse text-left">
                                            <thead>
                                                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-600">
                                                    <th className="w-16 px-4 py-3 text-center font-bold">STT</th>
                                                    <th className="px-4 py-3 font-bold">Mô tả</th>
                                                    <th className="px-4 py-3 font-bold">IMEI (nếu có)</th>
                                                    <th className="px-4 py-3 text-center font-bold">SL</th>
                                                    <th className="px-4 py-3 text-right font-bold">Đơn giá</th>
                                                    <th className="px-4 py-3 text-right font-bold">Thành tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                                {invoice.items?.map((item, index) => (
                                                    <tr key={item.id}>
                                                        <td className="px-4 py-4 text-center text-slate-500">{index + 1}</td>
                                                        <td className="px-4 py-4 font-semibold text-slate-900">{item.description}</td>
                                                        <td className="px-4 py-4 font-mono text-xs">{item.imei || '---'}</td>
                                                        <td className="px-4 py-4 text-center text-slate-900">{item.quantity}</td>
                                                        <td className="px-4 py-4 text-right text-slate-900">{formatCurrency(item.unit_price)}</td>
                                                        <td className="px-4 py-4 text-right font-bold text-slate-900">{formatCurrency(item.amount)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Tổng tiền */}
                                <div className="mb-20 flex justify-end">
                                    <div className="flex w-full flex-col gap-2 border-t-2 border-slate-800 py-4 md:w-[60%]">
                                        {(invoice.discount || 0) > 0 && (
                                            <div className="flex items-center justify-between text-slate-500">
                                                <span className="font-semibold uppercase">Giảm giá</span>
                                                <span className="font-medium">- {formatCurrency(invoice.discount)}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-lg font-bold uppercase text-slate-700">Tổng thanh toán</span>
                                            <span className="text-3xl font-bold tracking-tight text-slate-900">{formatCurrency(invoice.total_amount)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Chữ ký */}
                                <div className="mt-auto flex break-inside-avoid justify-between px-8 pb-10">
                                    <div className="text-center">
                                        <p className="mb-16 text-sm font-bold uppercase text-slate-500">
                                            {invoice.type === 'IMPORT' ? 'Người bán' : 'Khách hàng'}
                                        </p>
                                        <p className="text-lg font-bold text-slate-900">{invoice.customer_name || ''}</p>
                                        <p className="mt-1 text-xs italic text-slate-400">(Ký và ghi rõ họ tên)</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="mb-16 text-sm font-bold uppercase text-slate-500">Người lập phiếu</p>
                                        <p className="text-lg font-bold text-slate-900">{invoice.creator_name || 'Admin'}</p>
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
                                    <Printer className="h-5 w-5" /> In hoá đơn
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