// src/hooks/phone/usePhoneSearch.ts
import { useState, useMemo, useEffect, useRef } from 'react'
import { debounce } from 'lodash'
import { phoneService } from '@/services/phone.service'
import { Phone } from '@/types/phone'

interface UsePhoneSearchProps {
    status?: string
    hasSalePrice?: boolean
    invoiceStatus?: string // <-- Thêm Props
}

export const usePhoneSearch = ({ 
    status = 'IN_STOCK', 
    hasSalePrice = true, 
    invoiceStatus = 'PAID' // <-- Mặc định chỉ tìm máy Đã chốt
}: UsePhoneSearchProps = {}) => {
    const [isSearching, setIsSearching] = useState(false)
    const [searchResults, setSearchResults] = useState<Phone[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    
    const containerRef = useRef<HTMLDivElement>(null)

    const handleSearch = useMemo(
        () =>
            debounce(async (keyword: string) => {
                if (!keyword.trim()) {
                    setSearchResults([])
                    setIsSearching(false)
                    return
                }

                setIsSearching(true)
                try {
                    const res = await phoneService.getAll({
                        keyword,
                        status,
                        limit: 5,
                        page: 1,
                        has_sale_price: hasSalePrice,
                        invoice_status: invoiceStatus, // <-- Gửi xuống API
                    })
                    setSearchResults(res.data ?? [])
                } catch (error) {
                    setSearchResults([])
                } finally {
                    setIsSearching(false)
                }
            }, 500),
        [status, hasSalePrice, invoiceStatus],
    )

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        handleSearch(e.target.value)
    }

    const resetSearch = () => {
        setSearchResults([])
        setSearchTerm('')
    }

    const closeSearchResults = () => {
        setSearchResults([])
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setSearchResults([])
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return {
        searchTerm,
        setSearchTerm,
        searchResults,
        isSearching,
        containerRef,
        onSearchChange,
        resetSearch,
        closeSearchResults
    }
}