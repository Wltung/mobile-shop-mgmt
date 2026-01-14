'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react' // Bỏ import Search
import { usePhoneList } from '@/hooks/usePhoneList'

import DashboardHeader from '@/components/dashboard/DashboardHeader'
import PhoneStats from '@/components/phones/PhoneStats'
import PhoneTable from '@/components/phones/PhoneTable'
import ImportPhoneModal from '@/components/phones/import/ImportPhoneModal'

export default function ImportPage() {
    // 1. Lấy thêm filters và các hàm set từ Hook (đã cập nhật ở bước trước)
    const { 
        phones, isLoading, stats, meta, filters,
        setKeyword, setStatus, setPage, setDateFilter,
        formatCurrency, formatDate, refresh 
    } = usePhoneList()

    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <div className="flex h-full flex-col bg-[#f8fafc]">
            <DashboardHeader title="Quản lý Nhập máy" />

            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
                    
                    {/* Stats & Action Button */}
                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <PhoneStats
                            totalPhones={stats.totalPhones}
                            totalValue={stats.totalValue}
                            formatCurrency={formatCurrency}
                        />
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex flex-none transform items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] hover:bg-blue-600"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Nhập máy mới</span>
                        </button>
                    </div>

                    {/* --- ĐÃ BỎ SECTION SEARCH BAR CŨ Ở ĐÂY --- */}

                    <section className="flex flex-col gap-4">
                        <h3 className="text-lg font-bold leading-tight text-[#0f172a]">
                            Lịch sử Nhập máy
                        </h3>

                        {/* Truyền Props Filter xuống Table */}
                        <PhoneTable
                            phones={phones}
                            isLoading={isLoading}
                            meta={meta}
                            filters={filters}               // State filter
                            onKeywordChange={setKeyword}    // Hàm set keyword
                            onStatusChange={setStatus}      // Hàm set status
                            onPageChange={setPage}          // Hàm set page
                            onDateFilterChange={setDateFilter}
                            formatCurrency={formatCurrency}
                            formatDate={formatDate}
                        />
                    </section>
                </div>
            </div>

            <ImportPhoneModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => refresh()}
            />
        </div>
    )
}