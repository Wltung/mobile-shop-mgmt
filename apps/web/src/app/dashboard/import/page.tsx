'use client'

import { useState } from 'react'
import { Search, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { usePhoneList } from '@/hooks/usePhoneList' // Import Hook

// Import các Components đã tách
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import PhoneStats from '@/components/phones/PhoneStats'
import PhoneTable from '@/components/phones/PhoneTable'
import ImportPhoneModal from '@/components/phones/import/ImportPhoneModal'

export default function ImportPage() {
    const { toast } = useToast()
    // Lấy data và logic từ Hook
    const { 
        phones, isLoading, stats, 
        meta, goToPage, formatCurrency, 
        formatDate, refresh 
    } = usePhoneList()

    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <div className="flex h-full flex-col bg-[#f8fafc]">
            {/* 1. Header dùng chung */}
            <DashboardHeader title="Quản lý Nhập máy" />

            {/* 2. Content */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
                    {/* Section: Stats & Action Button */}
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

                    {/* Section: Search Bar (Có thể tách component nếu muốn) */}
                    <div className="w-full">
                        <label className="flex w-full flex-col">
                            <div className="flex h-14 w-full items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary">
                                <div className="flex items-center justify-center pl-6 text-slate-400">
                                    <Search className="h-5 w-5" />
                                </div>
                                <input
                                    className="flex h-full w-full min-w-0 flex-1 border-none bg-transparent px-4 text-base text-[#0f172a] placeholder:text-slate-400 focus:outline-0"
                                    placeholder="Tìm kiếm IMEI, tên khách hàng, đời máy..."
                                />
                                <div className="flex items-center pr-2">
                                    <button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-600">
                                        Tìm kiếm
                                    </button>
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Section: Table */}
                    <section className="flex flex-col gap-4">
                        <h3 className="text-lg font-bold leading-tight text-[#0f172a]">
                            Lịch sử Nhập máy
                        </h3>

                        <PhoneTable
                            phones={phones}
                            isLoading={isLoading}
                            meta={meta}             // Truyền Meta
                            onPageChange={goToPage} // Truyền hàm chuyển trang
                            formatCurrency={formatCurrency}
                            formatDate={formatDate}
                        />
                    </section>
                </div>
            </div>

            {/* Render Modal Component */}
            <ImportPhoneModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    refresh() // Load lại danh sách sau khi nhập thành công
                }}
            />
        </div>
    )
}
