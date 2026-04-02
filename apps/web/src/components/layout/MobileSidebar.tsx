'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'

export default function MobileSidebar() {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()

    // Lắng nghe sự thay đổi của URL: Hễ chuyển trang là tự động đóng Sidebar lại
    useEffect(() => {
        setOpen(false)
    }, [pathname])

    return (
        <div className="flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
            <div className="flex items-center gap-3">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <button className="flex h-10 w-10 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100">
                            <Menu className="h-6 w-6" />
                        </button>
                    </SheetTrigger>
                    {/* Bỏ padding và viền mặc định của Sheet để Sidebar nằm full màn hình */}
                    <SheetContent side="left" className="w-64 border-none p-0">
                        <Sidebar />
                    </SheetContent>
                </Sheet>
            </div>
            
            {/* Logo thu gọn trên Mobile Header */}
            <h1 className="text-base font-bold tracking-wide text-slate-800">
                ShopManager
            </h1>
            
            {/* Chỗ này để trống hoặc sau này bác có thể nhét avatar user vào đây */}
            <div className="h-8 w-8"></div> 
        </div>
    )
}