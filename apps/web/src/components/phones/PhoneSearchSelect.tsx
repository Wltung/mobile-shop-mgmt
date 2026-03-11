// src/components/sales/PhoneSearchSelect.tsx
'use client'

import { Loader2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Phone } from '@/types/phone'
import { usePhoneSearch } from '@/hooks/phone/usePhoneSearch'
import { useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'

interface Props {
    onSelect: (phone: Phone) => void
    label?: string
    placeholder?: string
    initialValue?: string // Giá trị hiển thị ban đầu (VD: iPhone 14...)
    error?: string        // Hiển thị lỗi form (nếu có)
    disabled?: boolean
    hasSalePrice?: boolean
}

export default function PhoneSearchSelect({ 
    onSelect, 
    label = "Tìm kiếm máy", 
    placeholder = "Nhập IMEI hoặc tên máy...",
    initialValue = "",
    error,
    disabled = false,
    hasSalePrice = true
}: Props) {
    const {
        searchTerm,
        setSearchTerm,
        searchResults,
        isSearching,
        containerRef,
        onSearchChange,
        resetSearch,
        closeSearchResults
    } = usePhoneSearch({ status: 'IN_STOCK', hasSalePrice })

    // Set giá trị ban đầu nếu có (dùng cho Edit form hoặc khi đã chọn)
    useEffect(() => {
        if (initialValue) {
            setSearchTerm(initialValue)
        }
    }, [initialValue, setSearchTerm])

    const handleSelect = (phone: Phone) => {
        onSelect(phone)
        // Set text hiển thị
        setSearchTerm(`${phone.model_name} - IMEI: ${phone.imei}`)
        // [FIX] Chỉ đóng dropdown, KHÔNG xoá text vừa set
        closeSearchResults()
    }

    // Style chung
    const inputClass = "h-11 rounded-xl border-slate-200 bg-slate-50/50 shadow-sm focus:border-primary focus:ring-primary focus:bg-white transition-all font-medium text-slate-800"

    return (
        <div className="relative" ref={containerRef}>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                {label} <span className="text-red-500">*</span>
            </label>
            
            <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Search className="h-5 w-5" />
                </span>
                
                <Input 
                    value={searchTerm}
                    onChange={onSearchChange}
                    placeholder={placeholder}
                    className={`${inputClass} pl-10 ${error ? 'border-red-500' : ''}`}
                    autoComplete="off"
                    disabled={disabled}
                />

                {/* Chỉ hiện loading nếu không disabled */}
                {!disabled && isSearching && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                )}
            </div>
            
            {error && <p className="text-sm font-medium text-red-500 mt-1">{error}</p>}

            {/* Dropdown Kết quả */}
            {!disabled && searchResults.length > 0 && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5">
                    {searchResults.map((phone) => (
                        <div
                            key={phone.id}
                            className="cursor-pointer border-b border-slate-50 px-4 py-3 last:border-0 hover:bg-slate-50 transition-colors"
                            onClick={() => handleSelect(phone)}
                        >
                            <p className="font-bold text-slate-800 text-sm">{phone.model_name}</p>
                            <div className="mt-1 flex justify-between text-xs text-slate-500">
                                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                                    {phone.imei}
                                </span>
                                <span className="font-bold text-primary">
                                    {/* NẾU CÓ GIÁ THÌ HIỂN THỊ, KHÔNG THÌ HIỂN THỊ '---' */}
                                    {phone.sale_price ? formatCurrency(phone.sale_price) : '---'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}