import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc]">
            <Sidebar />
            <main className="relative flex h-full flex-1 flex-col overflow-hidden">
                {children}
            </main>
        </div>
    )
}
