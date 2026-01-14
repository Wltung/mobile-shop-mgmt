import { Eye, Trash2, Loader2, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { PaginationMeta, Phone } from '@/types/phone'
import { PhoneFilterParams } from '@/types/phone'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface PhoneTableProps {
    phones: Phone[]
    isLoading: boolean
    meta: PaginationMeta
    filters: PhoneFilterParams
    onKeywordChange: (val: string) => void
    onStatusChange: (val: string) => void
    onPageChange: (p: number) => void
    formatCurrency: (val: number) => string
    formatDate: (val: string) => string
    onDateFilterChange: (val: string) => void
}

export default function PhoneTable({
    phones,
    isLoading,
    meta,
    filters,
    onKeywordChange,
    onStatusChange,
    onPageChange,
    formatCurrency,
    formatDate,
    onDateFilterChange,
}: PhoneTableProps) {

    // --- LOGIC PHÂN TRANG THÔNG MINH ---
    const generatePagination = (currentPage: number, totalPages: number) => {
        // Nếu ít hơn 7 trang, hiện tất cả
        if (totalPages <= 3) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages: (number | string)[] = [1]; // Luôn hiện trang 1

        // Logic hiển thị dấu ... và các trang ở giữa
        if (currentPage <= 3) {
            // Đang ở đầu: 1, 2, 3, 4, ..., 10
            pages.push(2, 3, 4, '...', totalPages);
        } else if (currentPage >= totalPages - 2) {
            // Đang ở cuối: 1, ..., 7, 8, 9, 10
            pages.push('...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            // Đang ở giữa: 1, ..., 4, 5, 6, ..., 10
            pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        }

        return pages;
    };

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
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
            </span>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {/* 1. HEADER: SEARCH & FILTER */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="relative w-full md:max-w-md">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <Search className="h-5 w-5" />
                        </div>
                        <Input
                            placeholder="Tìm kiếm theo mã IMEI, Tên máy..."
                            className="h-10 border-slate-300 pl-10 focus-visible:ring-primary"
                            value={filters.keyword || ''}
                            onChange={(e) => onKeywordChange(e.target.value)}
                        />
                    </div>
                    <div className="flex w-full gap-3 md:w-auto">
                        {/* Filter Date */}
                        <div className="relative min-w-[160px] flex-1 md:flex-none">
                            <Select onValueChange={(val) => onDateFilterChange(val)} defaultValue="all">
                                <SelectTrigger className="h-10 border-slate-300">
                                    <SelectValue placeholder="Thời gian" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả thời gian</SelectItem>
                                    <SelectItem value="today">Hôm nay</SelectItem>
                                    <SelectItem value="week">Tuần này</SelectItem>
                                    <SelectItem value="month">Tháng này</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="relative min-w-[160px] flex-1 md:flex-none">
                            <Select onValueChange={onStatusChange} value={filters.status || "ALL"}>
                                <SelectTrigger className="h-10 border-slate-300">
                                    <SelectValue placeholder="Tất cả trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="IN_STOCK">Trong kho</SelectItem>
                                    <SelectItem value="SOLD">Đã bán</SelectItem>
                                    <SelectItem value="REPAIRING">Đang sửa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. TABLE CONTENT */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-500">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-700">
                            <tr>
                                <th className="px-6 py-4 font-semibold">NGÀY NHẬP</th>
                                <th className="px-6 py-4 font-semibold">ĐỜI MÁY</th>
                                <th className="px-6 py-4 font-semibold">IMEI</th>
                                <th className="px-6 py-4 font-semibold">GIÁ NHẬP</th>
                                <th className="px-6 py-4 text-center font-semibold">TRẠNG THÁI</th>
                                <th className="px-6 py-4 text-center font-semibold">THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></td></tr>
                            ) : phones.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Không tìm thấy dữ liệu phù hợp.</td></tr>
                            ) : (
                                phones.map((phone) => (
                                    <tr key={phone.id} className="bg-white transition-colors hover:bg-slate-50">
                                        <td className="whitespace-nowrap px-6 py-4">{formatDate(phone.created_at)}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{phone.model_name}</td>
                                        <td className="px-6 py-4 font-bold font-mono text-slate-700">{phone.imei}</td>
                                        <td className="px-6 py-4 font-bold text-slate-700">{formatCurrency(phone.purchase_price)}</td>
                                        <td className="px-6 py-4 text-center">{renderStatus(phone.status)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="rounded p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary"><Eye className="h-4 w-4" /></button>
                                                <button className="rounded p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
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
                            {/* Container chính: isolate inline-flex -space-x-px rounded-md shadow-sm */}
                            <nav
                                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                                aria-label="Pagination"
                            >
                                {/* Nút Prev */}
                                <button
                                    onClick={() => onPageChange(meta.page - 1)}
                                    disabled={meta.page <= 1}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft className="h-5 w-5" />
                                </button>

                                {/* --- LOOP QUA CÁC TRANG --- */}
                                {generatePagination(meta.page, meta.total_pages).map((p, index) => (
                                    p === '...' ? (
                                        <span
                                            key={`ellipsis-${index}`}
                                            className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 focus:outline-offset-0"
                                        >
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => onPageChange(Number(p))}
                                            // Logic class: Nếu active (z-10 bg-primary text-white), nếu không (bg-white text-slate-900)
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                                                p === meta.page
                                                    ? 'z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                                                    : 'text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                ))}

                                {/* Nút Next */}
                                <button
                                    onClick={() => onPageChange(meta.page + 1)}
                                    disabled={meta.page >= meta.total_pages}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}