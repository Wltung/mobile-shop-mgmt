// src/components/common/detail/BackButton.tsx
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function BackButton({ className, ...props }: BackButtonProps) {
    return (
        <button
            className={cn(
                "flex items-center justify-center p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-primary hover:border-primary transition-colors shadow-sm",
                className
            )}
            {...props}
        >
            <ArrowLeft className="h-5 w-5" />
        </button>
    )
}