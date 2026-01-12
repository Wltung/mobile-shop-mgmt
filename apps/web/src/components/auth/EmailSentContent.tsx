// apps/web/src/components/auth/EmailSentContent.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MailCheck, Check, ArrowLeft, Timer, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function EmailSentContent() {
    const [countdown, setCountdown] = useState(60)
    const [canResend, setCanResend] = useState(false)

    // Logic đếm ngược
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        } else {
            setCanResend(true)
        }
    }, [countdown])

    const handleResend = () => {
        // Logic gọi API gửi lại email ở đây (nếu cần)
        // Sau đó reset lại timer
        setCountdown(60)
        setCanResend(false)
    }

    return (
        <div className="relative flex h-full w-full flex-col bg-white transition-colors duration-300 dark:bg-[#101922] lg:w-1/2">
            <div className="flex h-full w-full flex-col items-center justify-center overflow-y-auto p-6 pb-20 sm:p-12">
                <div className="flex w-full max-w-md flex-col items-center duration-700 animate-in fade-in slide-in-from-bottom-4">
                    {/* Icon Section */}
                    <div className="relative mb-8">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                            <MailCheck className="h-12 w-12 text-primary" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-green-500 dark:border-[#101922]">
                            <Check className="h-4 w-4 stroke-[4] text-white" />
                        </div>
                    </div>

                    {/* Text Section */}
                    <div className="mb-8 space-y-3 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-[#111418] dark:text-white">
                            Kiểm tra Email của bạn
                        </h1>
                        <p className="text-base leading-relaxed text-[#617589] dark:text-gray-400">
                            Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến
                            email của bạn. Vui lòng kiểm tra hộp thư đến (và cả
                            hòm thư Spam nếu cần).
                        </p>
                    </div>

                    {/* Back to Login Button */}
                    <Link href="/login" className="w-full">
                        <Button className="h-12 w-full bg-primary text-base font-bold shadow-sm shadow-primary/30 hover:bg-blue-600">
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Quay lại Đăng nhập
                        </Button>
                    </Link>

                    {/* Resend Section */}
                    <div className="mt-8 flex w-full flex-col items-center gap-3 border-t border-gray-100 pt-6 dark:border-gray-800">
                        <p className="text-sm text-[#617589] dark:text-gray-400">
                            Không nhận được email?
                        </p>

                        {canResend ? (
                            // Nút Gửi lại (Khi hết giờ)
                            <Button
                                variant="outline"
                                onClick={handleResend}
                                className="rounded-full border-primary text-primary hover:bg-primary/10 hover:text-primary"
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Gửi lại Email
                            </Button>
                        ) : (
                            // Bộ đếm ngược (Khi đang chờ)
                            <div className="flex select-none items-center gap-2 rounded-full bg-[#f6f7f8] px-4 py-2 dark:bg-gray-800/50">
                                <Timer className="h-5 w-5 text-[#617589] dark:text-gray-400" />
                                <div className="flex gap-1 text-sm font-medium text-[#617589] dark:text-gray-400">
                                    <span>Gửi lại sau</span>
                                    <span className="w-[24px] text-center font-bold tabular-nums text-primary">
                                        {countdown}s
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Copyright */}
            <div className="absolute bottom-6 w-full text-center text-xs text-gray-400">
                © 2026 Mobile Shop Management System
            </div>
        </div>
    )
}
