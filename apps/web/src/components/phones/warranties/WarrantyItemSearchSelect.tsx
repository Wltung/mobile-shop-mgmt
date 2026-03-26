'use client'

import { Loader2, Search, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useWarrantySearch } from '@/hooks/warranty/useWarrantySearch'
import { useEffect } from 'react'
import { formatDate } from '@/lib/utils'

interface Props {
    type: 'SALE' | 'REPAIR'
    onSelect: (item: any, isExpired: boolean, formattedDate: string) => void
    error?: string
}

export default function WarrantyItemSearchSelect({ type, onSelect, error }: Props) {
    const {
        searchTerm, setSearchTerm, searchResults, isSearching,
        containerRef, onSearchChange, closeSearchResults, resetSearch
    } = useWarrantySearch(type)

    useEffect(() => {
        resetSearch()
    }, [type, resetSearch])

    const handleSelect = (item: any) => {
        const expiryDate = item.warranty_expiry ? new Date(item.warranty_expiry) : new Date()
        const isExpired = expiryDate < new Date()
        const formattedDate = item.warranty_expiry ? item.warranty_expiry.split('T')[0] : ''

        // DATA ĐÃ SẠCH TỪ BE, KHÔNG CẦN PARSE NỮA
        const displayDeviceName = item.device_name || 'Không xác định'
        const displayImei = item.imei || ''

        onSelect({ 
            ...item, 
            calculated_device_name: displayDeviceName,
            calculated_imei: displayImei 
        }, isExpired, formattedDate)
        
        if (type === 'SALE') {
            setSearchTerm(`${displayDeviceName} - IMEI: ${displayImei || 'Không có'}`)
        } else {
            setSearchTerm(`${displayDeviceName} - ${item.invoice_code || '#HD-' + item.invoice_id}`)
        }
        closeSearchResults()
    }

    return (
        <div className="relative" ref={containerRef}>
            <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Search className="h-5 w-5" />
                </span>
                <Input 
                    value={searchTerm}
                    onChange={onSearchChange}
                    placeholder={type === 'SALE' ? "Nhập IMEI, Tên khách máy bán..." : "Nhập SĐT, Tên khách máy sửa..."}
                    className={`h-11 rounded-xl border-slate-200 bg-slate-50/50 pl-10 shadow-sm focus:border-primary focus:ring-primary focus:bg-white transition-all font-medium text-slate-800 ${error ? 'border-red-500' : ''}`}
                    autoComplete="off"
                />
                {isSearching && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                )}
            </div>
            
            {error && <p className="text-sm font-medium text-red-500 mt-1">{error}</p>}

            {searchResults.length > 0 && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5">
                    {searchResults.map((item) => {
                        const expiryDate = item.warranty_expiry ? new Date(item.warranty_expiry) : new Date()
                        const isExpired = expiryDate < new Date()
                        
                        const displayDeviceName = item.device_name || 'Không xác định'
                        const displayImei = item.imei || ''

                        return (
                            <div
                                key={item.invoice_id + '-' + (item.phone_id || item.item_id || Math.random())}
                                className="cursor-pointer border-b border-slate-50 px-4 py-3 last:border-0 hover:bg-slate-50 transition-colors"
                                onClick={() => handleSelect(item)}
                            >
                                <div className="flex justify-between items-start mb-1.5">
                                    <p className="font-bold text-slate-800 text-sm">
                                        {displayDeviceName} <span className="text-slate-500 font-normal">({item.customer_name || 'Khách vãng lai'})</span>
                                    </p>
                                    
                                    {isExpired ? (
                                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full shrink-0 ml-2">
                                            <AlertCircle className="h-3 w-3" /> Hết hạn
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full shrink-0 ml-2">
                                            <CheckCircle2 className="h-3 w-3" /> Còn hạn
                                        </span>
                                    )}
                                </div>

                                {/* ĐÃ FIX: PHÂN BIỆT RÕ RÀNG LINH KIỆN VÀ DỊCH VỤ */}
                                {type === 'REPAIR' && item.part_name && (
                                    <p className="text-[13px] text-blue-600 font-medium mt-0.5 mb-2">
                                        {item.item_type === 'SERVICE' ? 'Dịch vụ: ' : 'Linh kiện: '}
                                        <span className="text-slate-700">{item.part_name}</span>
                                    </p>
                                )}

                                {/* ĐÃ FIX: DỌN SẠCH 00:00 VÀ DỊCH MÃ HOÁ ĐƠN SANG PHẢI */}
                                <div className="flex justify-between items-center text-xs text-slate-500">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                                            IMEI: {displayImei || '---'}
                                        </span>
                                        <span>
                                            Hạn BH: <span className={`font-semibold ${isExpired ? 'text-red-500' : 'text-slate-700'}`}>
                                                {item.warranty_expiry 
                                                    ? new Date(item.warranty_expiry).toLocaleDateString('vi-VN') 
                                                    : '---'}
                                            </span>
                                        </span>
                                    </div>
                                    
                                    {type === 'REPAIR' && (
                                        <span className="font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100 font-bold">
                                            {item.invoice_code || `#HD-${item.invoice_id}`}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}