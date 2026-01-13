import { Eye, Trash2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { PaginationMeta, Phone } from '@/types/phone'

interface PhoneTableProps {
    phones: Phone[]
    isLoading: boolean
    meta: PaginationMeta
    onPageChange: (p: number) => void
    formatCurrency: (val: number) => string
    formatDate: (val: string) => string
}

export default function PhoneTable({
    phones,
    isLoading,
    meta,
    onPageChange,
    formatCurrency,
    formatDate,
}: PhoneTableProps) {
    const renderStatus = (status: string) => {
        const styles: Record<string, string> = {
            IN_STOCK: 'bg-green-100 text-green-800',
            SOLD: 'bg-slate-100 text-slate-800',
            REPAIRING: 'bg-yellow-100 text-yellow-800',
        }
        const labels: Record<string, string> = {
            IN_STOCK: 'Trong kho',
            SOLD: 'Đã bán',
            REPAIRING: 'Đang sửa',
        }
        return (
            <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}
            >
                {labels[status] || status}
            </span>
        )
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-500">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-700">
                        <tr>
                            <th className="px-6 py-4 font-semibold">
                                NGÀY NHẬP
                            </th>
                            <th className="px-6 py-4 font-semibold">ĐỜI MÁY</th>
                            <th className="px-6 py-4 font-semibold">IMEI</th>
                            <th className="px-6 py-4 font-semibold">
                                GIÁ NHẬP
                            </th>
                            <th className="px-6 py-4 text-center font-semibold">
                                TRẠNG THÁI
                            </th>
                            <th className="px-6 py-4 text-center font-semibold">
                                THAO TÁC
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {isLoading ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-8 text-center"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        <span>Đang tải dữ liệu...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : phones.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-8 text-center text-slate-400"
                                >
                                    Chưa có dữ liệu máy nào.
                                </td>
                            </tr>
                        ) : (
                            phones.map((phone) => (
                                <tr
                                    key={phone.id}
                                    className="bg-white transition-colors hover:bg-slate-50"
                                >
                                    <td className="whitespace-nowrap px-6 py-4">
                                        {formatDate(phone.created_at)}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {phone.model_name}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-600">
                                        {phone.imei}
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        {formatCurrency(phone.purchase_price)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {renderStatus(phone.status)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="rounded p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button className="rounded p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- PHẦN PHÂN TRANG (PAGINATION) --- */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
                {/* Mobile View */}
                <div className="flex flex-1 justify-between sm:hidden">
                    <button
                        onClick={() => onPageChange(meta.page - 1)}
                        disabled={meta.page <= 1}
                        className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                        Trước
                    </button>
                    <button
                        onClick={() => onPageChange(meta.page + 1)}
                        disabled={meta.page >= meta.total_pages}
                        className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                        Sau
                    </button>
                </div>

                {/* Desktop View */}
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-slate-700">
                            Hiển thị{' '}
                            <span className="font-medium">
                                {(meta.page - 1) * meta.limit + 1}
                            </span>{' '}
                            đến{' '}
                            <span className="font-medium">
                                {Math.min(meta.page * meta.limit, meta.total)}
                            </span>{' '}
                            trong số{' '}
                            <span className="font-medium">{meta.total}</span>{' '}
                            kết quả
                        </p>
                    </div>
                    <div>
                        <nav
                            className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
                            aria-label="Pagination"
                        >
                            {/* Nút Prev */}
                            <button
                                onClick={() => onPageChange(meta.page - 1)}
                                disabled={meta.page <= 1}
                                className="relative inline-flex items-center rounded-l-md border border-slate-300 bg-white px-2 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:bg-slate-100"
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            {/* Render số trang (Đơn giản hóa: Vẽ hết, nếu nhiều quá thì cần logic ... ) */}
                            {Array.from(
                                { length: meta.total_pages },
                                (_, i) => i + 1,
                            ).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => onPageChange(p)}
                                    className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                                        p === meta.page
                                            ? 'z-10 border-primary bg-primary/10 text-primary'
                                            : 'border-slate-300 bg-white text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}

                            {/* Nút Next */}
                            <button
                                onClick={() => onPageChange(meta.page + 1)}
                                disabled={meta.page >= meta.total_pages}
                                className="relative inline-flex items-center rounded-r-md border border-slate-300 bg-white px-2 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:bg-slate-100"
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    )
}
