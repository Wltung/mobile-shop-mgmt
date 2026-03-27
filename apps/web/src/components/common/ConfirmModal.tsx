import { ReactNode } from 'react'
import { ShieldAlert, AlertTriangle } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: ReactNode
    confirmText?: string
    cancelText?: string
    isLoading?: boolean
    variant?: 'danger' | 'warning' // Cho phép chọn màu Đỏ (xoá) hoặc Vàng (cảnh báo)
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    isLoading = false,
    variant = 'danger'
}: ConfirmModalProps) {
    const isDanger = variant === 'danger'

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent className="max-w-[420px] p-6 md:p-8 rounded-3xl border-none shadow-2xl">
                <AlertDialogHeader className="flex flex-col items-center gap-4 text-center">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-full ${isDanger ? 'bg-red-50' : 'bg-amber-50'}`}>
                        {isDanger ? <ShieldAlert className="h-8 w-8 text-red-600" /> : <AlertTriangle className="h-8 w-8 text-amber-600" />}
                    </div>
                    <AlertDialogTitle className="text-xl font-bold text-slate-900 mt-2">
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-[15px] font-medium text-center leading-relaxed text-slate-500">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="mt-8 flex w-full flex-row gap-3 sm:space-x-0">
                    <AlertDialogCancel 
                        onClick={onClose}
                        className="mt-0 w-full flex-1 rounded-xl h-12 border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                    >
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault() // Ngăn modal tự đóng ngay lập tức nếu cần chờ API
                            onConfirm()
                        }}
                        disabled={isLoading}
                        className={`w-full flex-1 rounded-xl h-12 font-bold text-sm text-white shadow-lg transition-all ${
                            isDanger 
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' 
                                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                        }`}
                    >
                        {isLoading ? 'Đang xử lý...' : confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}