'use client'

import { Loader2, Search, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useWarrantySearch } from '@/hooks/warranty/useWarrantySearch'
import { useEffect } from 'react'
import { formatDate } from '@/lib/utils'
import { parseRepairDescription } from '@/lib/repairParser'

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

    // --- HÀM BÓC TÁCH TÊN MÁY TỪ REPAIR DESCRIPTION ---
    // --- HÀM BÓC TÁCH TÊN MÁY TỪ REPAIR DESCRIPTION ---
    // --- HÀM BÓC TÁCH TÊN MÁY VÀ IMEI TỪ REPAIR DESCRIPTION ---
    const getDeviceDetailsForRepair = (item: any) => {
        const rawDesc = item.repair_description || ''
        const dbDeviceName = item.repair_device_name || item.phone_model || item.model_name || ''

        // Parse để lấy Tên máy và IMEI thực tế
        const parsed = parseRepairDescription(rawDesc, dbDeviceName)
        let name = parsed.deviceName
        // Ưu tiên IMEI trong DB (nếu máy mua ở quán), nếu không có thì lấy IMEI bóc từ chuỗi mô tả (máy khách ngoài)
        let imei = item.imei || parsed.imei || '' 

        if (name === 'Không xác định' && item.device_name) {
            if (item.device_name.startsWith('Linh kiện thay thế: ')) {
                name = item.device_name.replace('Linh kiện thay thế: ', '').trim()
            } else if (item.device_name.startsWith('Công sửa chữa: ')) {
                name = item.device_name.replace('Công sửa chữa: ', '').trim()
            }
        }

        return {
            deviceName: name !== 'Không xác định' ? name : (item.device_name || 'Không xác định'),
            imei: imei
        }
    }

    const handleSelect = (item: any) => {
        const expiryDate = item.warranty_expiry ? new Date(item.warranty_expiry) : new Date()
        const isExpired = expiryDate < new Date()
        const formattedDate = item.warranty_expiry ? item.warranty_expiry.split('T')[0] : ''

        let calculatedDeviceName = item.device_name || item.model_name || ''
        let calculatedImei = item.imei || ''

        if (type === 'REPAIR') {
            const details = getDeviceDetailsForRepair(item)
            calculatedDeviceName = details.deviceName
            calculatedImei = details.imei // Lấy IMEI đã bóc tách
        }

        // Truyền thêm calculated_imei lên component cha
        onSelect({ 
            ...item, 
            calculated_device_name: calculatedDeviceName,
            calculated_imei: calculatedImei 
        }, isExpired, formattedDate)
        
        if (type === 'SALE') {
            setSearchTerm(`${calculatedDeviceName} - IMEI: ${calculatedImei || 'Không có'}`)
        } else {
            setSearchTerm(`${calculatedDeviceName} - HĐ #${item.invoice_id}`)
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

                        // Xử lý hiển thị Tên máy và IMEI trong danh sách Dropdown
                        let displayDeviceName = item.device_name || item.model_name || 'Không xác định'
                        let displayImei = item.imei || ''

                        if (type === 'REPAIR') {
                            const details = getDeviceDetailsForRepair(item)
                            const parsedName = details.deviceName
                            displayImei = details.imei // Show IMEI bóc tách ở dropdown

                            const partName = item.device_name 
                            if (parsedName !== 'Không xác định') {
                                if (partName && partName !== parsedName && !partName.startsWith('Linh kiện thay thế:')) {
                                    displayDeviceName = `${parsedName} (${partName})`
                                } else {
                                    displayDeviceName = parsedName
                                }
                            }
                        }

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

                                <div className="flex justify-between items-center text-xs text-slate-500">
                                    <div className="flex items-center gap-2">
                                        {/* Hiển thị displayImei thay vì item.imei */}
                                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                                            IMEI: {displayImei || '---'}
                                        </span>
                                        {type === 'REPAIR' && (
                                            <span className="font-mono bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                                                #HD-{item.invoice_id}
                                            </span>
                                        )}
                                    </div>
                                    <span>
                                        Hạn: <span className={`font-semibold ${isExpired ? 'text-red-500' : 'text-slate-700'}`}>
                                            {item.warranty_expiry ? formatDate(item.warranty_expiry).split(' ')[0] : '---'}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}