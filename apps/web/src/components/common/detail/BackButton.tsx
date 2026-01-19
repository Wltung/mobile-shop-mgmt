// src/components/common/detail/BackButton.tsx
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function BackButton({ className, ...props }: BackButtonProps) {
    return (
        <button
            className={cn(
                'flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-colors hover:border-primary hover:text-primary',
                className,
            )}
            {...props}
        >
            <ArrowLeft className="h-5 w-5" />
        </button>
    )
}
