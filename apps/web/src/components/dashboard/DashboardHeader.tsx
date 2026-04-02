// src/components/dashboard/DashboardHeader.tsx
'use client'
import { Menu, Bell, HelpCircle } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import Sidebar from '../layout/Sidebar'

interface DashboardHeaderProps {
    title: string
}

export default function DashboardHeader({ title }: DashboardHeaderProps) {
    const user = useAuthStore((state) => state.user)

    // State quản lý việc mở/đóng ngăn kéo Sidebar trên Mobile
    const [open, setOpen] = useState(false)
    const pathname = usePathname()

    // Tự động đóng Sidebar khi bấm vào một link để chuyển trang
    useEffect(() => {
        setOpen(false)
    }, [pathname])

    return (
        <header className="z-10 flex flex-none items-center justify-between whitespace-nowrap border-b border-slate-200 bg-white px-8 py-4">
            <div className="flex items-center gap-4 text-[#0f172a]">
                <div className="lg:hidden">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <button className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-slate-100">
                                <Menu className="h-6 w-6 cursor-pointer" />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 border-none p-0">
                            <Sidebar />
                        </SheetContent>
                    </Sheet>
                </div>

                <h2 className="text-xl font-bold leading-tight tracking-tight text-[#0f172a]">
                    {title}
                </h2>
            </div>

            <div className="flex flex-1 justify-end gap-6">
                <div className="flex items-center gap-2">
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[#0f172a] transition-colors hover:bg-primary/10 hover:text-primary">
                        <Bell className="h-5 w-5" />
                    </button>
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[#0f172a] transition-colors hover:bg-primary/10 hover:text-primary">
                        <HelpCircle className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-500">
                        {user?.full_name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="hidden flex-col md:flex">
                        <span className="text-sm font-bold text-[#0f172a]">
                            {user?.full_name || 'Admin'}
                        </span>
                        <span className="text-xs capitalize text-slate-500">
                            {user?.role || 'Staff'}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    )
}
