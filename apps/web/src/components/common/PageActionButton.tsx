// src/components/common/PageActionButton.tsx
import { ReactNode } from "react"
import { cn } from "@/lib/utils" // Hàm tiện ích class của shadcn (nếu có), hoặc dùng template string

interface PageActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string
    icon?: ReactNode
}

export default function PageActionButton({ 
    label, 
    icon, 
    className, 
    ...props 
}: PageActionButtonProps) {
    return (
        <button
            className={cn(
                "flex flex-none transform items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] hover:bg-blue-600",
                className
            )}
            {...props}
        >
            {icon}
            <span>{label}</span>
        </button>
    )
}