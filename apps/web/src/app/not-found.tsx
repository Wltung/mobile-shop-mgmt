import Link from 'next/link'
import { Smartphone, Home, HelpCircle, ArrowRight } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
            <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden">
                <div className="flex h-full grow flex-col">
                    
                    {/* Header / Navbar */}
                    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-white px-6 md:px-10 py-4 shadow-sm z-10">
                        <div className="flex items-center gap-3 text-slate-900">
                            <div className="flex h-8 w-8 items-center justify-center text-blue-600">
                                <Smartphone className="h-7 w-7" />
                            </div>
                            <h2 className="text-slate-900 text-xl font-bold leading-tight tracking-[-0.015em]">
                                ShopManager
                            </h2>
                        </div>
                        <div className="hidden md:flex items-center gap-6">
                            <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Trang chủ</Link>
                            <Link href="/dashboard/phones" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Sản phẩm</Link>
                            <Link href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Hỗ trợ</Link>
                        </div>
                    </header>

                    {/* Main Content Area */}
                    <main className="flex flex-1 justify-center items-center py-12 px-4 md:px-10">
                        <div className="flex flex-col items-center justify-center max-w-[960px] w-full flex-1 gap-10">
                            
                            {/* 404 Illustration & Text */}
                            <div className="flex flex-col items-center gap-8 w-full">
                                
                                {/* Illustration */}
                                <div 
                                    className="relative w-full max-w-[400px] aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white flex items-center justify-center border border-slate-100"
                                    style={{ backgroundImage: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0.15) 100%)' }}
                                >
                                    {/* Abstract SVG Representation for 404 */}
                                    <svg className="text-blue-600 opacity-90 drop-shadow-md" fill="none" height="180" viewBox="0 0 240 180" width="240" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M70 40H170C175.523 40 180 44.4772 180 50V130C180 135.523 175.523 140 170 140H70C64.4772 140 60 135.523 60 130V50C60 44.4772 64.4772 40 70 40Z" stroke="currentColor" strokeWidth="4"></path>
                                        <path d="M90 70L150 110" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>
                                        <path d="M150 70L90 110" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>
                                        <circle cx="120" cy="125" fill="currentColor" r="5"></circle>
                                        <path d="M100 25H140" stroke="currentColor" strokeLinecap="round" strokeWidth="2"></path>
                                        <path d="M110 155H130" stroke="currentColor" strokeLinecap="round" strokeWidth="2"></path>
                                        <text className="opacity-10" fill="currentColor" fontFamily="inherit" fontSize="48" fontWeight="900" textAnchor="middle" x="120" y="105">404</text>
                                    </svg>
                                </div>

                                {/* Text Content */}
                                <div className="flex max-w-[600px] flex-col items-center gap-4 text-center">
                                    <h1 className="text-slate-900 text-4xl md:text-5xl font-black leading-tight tracking-[-0.02em]">
                                        404 - Không tìm thấy trang
                                    </h1>
                                    <p className="text-slate-500 text-lg font-medium leading-relaxed">
                                        Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đang trong giao đoạn phát triển.
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center mt-2">
                                    <Link 
                                        href="/dashboard" 
                                        className="flex min-w-[220px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-13 px-6 bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:-translate-y-0.5 text-white text-base font-bold leading-normal tracking-[0.015em] shadow-lg shadow-blue-600/20"
                                    >
                                        <Home className="mr-2 h-5 w-5" />
                                        <span className="truncate">Quay lại Trang chủ</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Additional Support Section */}
                            <div className="w-full max-w-[640px] mt-4">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-md transition-shadow">
                                    <div className="flex flex-col gap-1 text-center md:text-left">
                                        <p className="text-slate-900 text-base font-bold leading-tight flex items-center justify-center md:justify-start gap-2">
                                            <HelpCircle className="h-5 w-5 text-blue-600" />
                                            Cần sự giúp đỡ khác?
                                        </p>
                                        <p className="text-slate-500 text-sm font-medium leading-normal">
                                            Nếu bạn tin rằng đây là lỗi hệ thống, vui lòng báo cáo.
                                        </p>
                                    </div>
                                    <Link 
                                        href="#" 
                                        className="group flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors px-5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100"
                                    >
                                        Liên hệ hỗ trợ kỹ thuật
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>

                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="flex justify-center py-6 border-t border-slate-200 bg-white mt-auto">
                        <p className="text-slate-400 font-medium text-sm">© 2024 ShopManager. All rights reserved.</p>
                    </footer>

                </div>
            </div>
        </div>
    )
}