import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { debounce } from 'lodash'
import { warrantyService } from '@/services/warranty.service'

export const useWarrantySearch = (type: 'SALE' | 'REPAIR') => {
    const [isSearching, setIsSearching] = useState(false)
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)

    const handleSearch = useMemo(
        () =>
            debounce(async (keyword: string, searchType: 'SALE' | 'REPAIR') => {
                if (!keyword.trim()) {
                    setSearchResults([])
                    setIsSearching(false)
                    return
                }

                setIsSearching(true)
                try {
                    const res = await warrantyService.searchEligible({ keyword, type: searchType })
                    setSearchResults(res.data ?? [])
                } catch (error) {
                    setSearchResults([])
                } finally {
                    setIsSearching(false)
                }
            }, 500),
        []
    )

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        handleSearch(e.target.value, type)
    }

    const resetSearch = useCallback(() => {
        setSearchResults([])
        setSearchTerm('')
    }, [])

    const closeSearchResults = useCallback(() => setSearchResults([]), [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setSearchResults([])
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        resetSearch()
    }, [type, resetSearch])

    return { searchTerm, setSearchTerm, searchResults, isSearching, containerRef, onSearchChange, resetSearch, closeSearchResults }
}