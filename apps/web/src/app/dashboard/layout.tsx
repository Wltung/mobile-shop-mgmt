import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc]">
            {/* Đổi sang lg:flex để ép ẩn Sidebar tĩnh trên điện thoại quay ngang và tablet */}
            <div className="hidden lg:flex">
                <Sidebar />
            </div>
            
            <main className="relative flex h-full flex-1 flex-col overflow-hidden">
                {children}
            </main>
        </div>
    )
}