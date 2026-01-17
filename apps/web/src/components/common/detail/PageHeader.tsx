// src/components/common/detail/PageHeader.tsx
import { ReactNode } from 'react'

interface PageHeaderProps {
    title: string
    status?: ReactNode      // Badge trạng thái (Optional)
    subtitle?: ReactNode    // Dòng thông tin phụ bên dưới (Optional)
    actions?: ReactNode     // Các nút bấm bên phải (Optional)
}

export default function PageHeader({ 
    title, 
    status, 
    subtitle, 
    actions 
}: PageHeaderProps) {
    return (
        <div className="mt-2 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            {/* Left Side: Title & Subtitle */}
            <div>
                <div className="mb-1 flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        {title}
                    </h1>
                    {status}
                </div>
                
                {subtitle && (
                    <div className="font-medium text-slate-500">
                        {subtitle}
                    </div>
                )}
            </div>
            
            {/* Right Side: Action Buttons */}
            {actions && (
                <div className="flex gap-3">
                    {actions}
                </div>
            )}
        </div>
    )
}