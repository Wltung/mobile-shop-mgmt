// src/components/common/PageBreadcrumb.tsx
'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import BackButton from '@/components/common/detail/BackButton' // Tái sử dụng nút Back đã làm

export interface BreadcrumbItem {
    label: string
    href?: string // Nếu không có href => Là trang hiện tại (Active)
}

interface PageBreadcrumbProps {
    items: BreadcrumbItem[]
    onBack?: () => void // Tùy chọn: Nếu muốn override hành vi back mặc định
}

export default function PageBreadcrumb({ items, onBack }: PageBreadcrumbProps) {
    const router = useRouter()

    const handleBack = () => {
        if (onBack) {
            onBack()
        } else {
            router.back()
        }
    }

    return (
        <div className="flex items-center gap-3">
            {/* 1. Nút Back luôn nằm đầu */}
            <BackButton onClick={handleBack} />

            {/* 2. Dải Breadcrumb */}
            <nav className="flex text-sm font-medium text-slate-500">
                <ol className="flex items-center gap-2">
                    {items.map((item, index) => {
                        const isLast = index === items.length - 1
                        
                        return (
                            <li key={index} className="flex items-center gap-2">
                                {/* Nếu không phải phần tử đầu tiên, thêm dấu > */}
                                {index > 0 && (
                                    <ChevronRight className="h-4 w-4 text-slate-400" />
                                )}

                                {isLast || !item.href ? (
                                    // Item cuối cùng hoặc không có link -> Màu đậm, không click được
                                    <span className="font-semibold text-primary">
                                        {item.label}
                                    </span>
                                ) : (
                                    // Item thường -> Có link, màu xám
                                    <Link 
                                        href={item.href} 
                                        className="transition-colors hover:text-primary"
                                    >
                                        {item.label}
                                    </Link>
                                )}
                            </li>
                        )
                    })}
                </ol>
            </nav>
        </div>
    )
}