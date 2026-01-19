// src/components/common/DataTable.tsx
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { ReactNode } from 'react'
import { ColumnDef } from '@/types/common'

interface PaginationMeta {
    page: number
    limit: number
    total: number
    total_pages: number
}

interface DataTableProps<T> {
    data: T[]
    columns: ColumnDef<T>[]
    isLoading: boolean
    meta: PaginationMeta
    onPageChange: (page: number) => void

    // Slot để truyền thanh search/filter vào
    toolbar?: ReactNode
}

export function DataTable<T extends { id: number | string }>({
    data,
    columns,
    isLoading,
    meta,
    onPageChange,
    toolbar,
}: DataTableProps<T>) {
    // --- LOGIC PHÂN TRANG (TÁI SỬ DỤNG) ---
    const generatePagination = (currentPage: number, totalPages: number) => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1)
        }
        const pages: (number | string)[] = [1]
        if (currentPage <= 3) {
            pages.push(2, 3, 4, '...', totalPages)
        } else if (currentPage >= totalPages - 2) {
            pages.push(
                '...',
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages,
            )
        } else {
            pages.push(
                '...',
                currentPage - 1,
                currentPage,
                currentPage + 1,
                '...',
                totalPages,
            )
        }
        return pages
    }

    return (
        <div className="flex flex-col gap-4">
            {/* 1. TOOLBAR (Search & Filters) - Render từ bên ngoài truyền vào */}
            {toolbar && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    {toolbar}
                </div>
            )}

            {/* 2. TABLE */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-500">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-700">
                            <tr>
                                {columns.map((col, index) => (
                                    <th
                                        key={index}
                                        className={`px-6 py-4 font-semibold ${col.className || ''}`}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-6 py-8 text-center"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            <span>Đang tải dữ liệu...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-6 py-8 text-center text-slate-400"
                                    >
                                        Không tìm thấy dữ liệu phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                data.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="bg-white transition-colors hover:bg-slate-50"
                                    >
                                        {columns.map((col, index) => (
                                            <td
                                                key={index}
                                                className={`px-6 py-4 ${col.className || ''}`}
                                            >
                                                {/* Nếu có hàm cell tuỳ chỉnh thì dùng, không thì lấy value từ key */}
                                                {col.cell
                                                    ? col.cell(row)
                                                    : col.accessorKey
                                                      ? (row[
                                                            col.accessorKey
                                                        ] as ReactNode)
                                                      : null}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 3. PAGINATION (GIỮ NGUYÊN STYLE CŨ) */}
                <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-slate-700">
                                Hiển thị{' '}
                                <span className="font-bold text-slate-900">
                                    {(meta.page - 1) * meta.limit + 1}
                                </span>{' '}
                                đến{' '}
                                <span className="font-bold text-slate-900">
                                    {Math.min(
                                        meta.page * meta.limit,
                                        meta.total,
                                    )}
                                </span>{' '}
                                trong số{' '}
                                <span className="font-bold text-slate-900">
                                    {meta.total}
                                </span>{' '}
                                kết quả
                            </p>
                        </div>
                        <div>
                            <nav
                                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                                aria-label="Pagination"
                            >
                                <button
                                    onClick={() => onPageChange(meta.page - 1)}
                                    disabled={meta.page <= 1}
                                    className="relative inline-flex items-center rounded-l-md border border-slate-300 bg-white px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 disabled:bg-slate-100 disabled:opacity-50"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                {generatePagination(
                                    meta.page,
                                    meta.total_pages,
                                ).map((p, index) =>
                                    p === '...' ? (
                                        <span
                                            key={`ellipsis-${index}`}
                                            className="relative inline-flex items-center border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
                                        >
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() =>
                                                onPageChange(Number(p))
                                            }
                                            className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium focus:z-20 ${
                                                p === meta.page
                                                    ? 'z-10 border-primary bg-primary text-white'
                                                    : 'border-slate-300 bg-white text-slate-500 hover:bg-slate-50'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ),
                                )}
                                <button
                                    onClick={() => onPageChange(meta.page + 1)}
                                    disabled={meta.page >= meta.total_pages}
                                    className="relative inline-flex items-center rounded-r-md border border-slate-300 bg-white px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 disabled:bg-slate-100 disabled:opacity-50"
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
