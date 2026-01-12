// apps/web/src/components/auth/ResetPasswordForm.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    Lock,
    Eye,
    EyeOff,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    RotateCw,
    Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { useResetPassword } from '@/hooks/useResetPassword'

export default function ResetPasswordForm() {
    const { form, isLoading, onSubmit } = useResetPassword()

    // State quản lý ẩn hiện mật khẩu
    const [showPass, setShowPass] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    // Hàm tính độ mạnh mật khẩu giả lập (để hiển thị thanh màu)
    const getPasswordStrength = (pass: string) => {
        if (!pass) return 0
        if (pass.length < 6) return 1 // Yếu
        if (pass.length < 10) return 3 // Trung bình
        return 4 // Mạnh
    }

    const password = form.watch('password')
    const strength = getPasswordStrength(password)

    return (
        <div className="flex w-full flex-col items-center justify-center overflow-y-auto bg-white p-6 dark:bg-[#101922] sm:p-12 lg:w-1/2 lg:p-24">
            <div className="flex w-full max-w-[480px] flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col gap-2 text-center lg:text-left">
                    <div className="mb-2 flex justify-center lg:justify-start">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <RotateCw className="h-6 w-6" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-black leading-tight tracking-[-0.033em] text-[#111418] dark:text-white sm:text-4xl">
                        Thiết lập mật khẩu mới
                    </h1>
                    <p className="text-base font-normal leading-normal text-[#617589] dark:text-slate-400">
                        Vui lòng nhập mật khẩu mới để bảo mật tài khoản của bạn.
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={onSubmit} className="flex flex-col gap-5">
                        {/* New Password Field */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-[#111418] dark:text-slate-200">
                                        Mật khẩu mới
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative flex w-full items-center rounded-lg border border-[#dbe0e6] bg-white focus-within:border-primary focus-within:ring-1 focus-within:ring-primary dark:border-slate-700 dark:bg-slate-800">
                                            <div className="flex items-center justify-center pl-4 text-slate-400">
                                                <Lock className="h-5 w-5" />
                                            </div>
                                            <Input
                                                type={
                                                    showPass
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                placeholder="••••••••"
                                                className="h-12 flex-1 border-none bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPass(!showPass)
                                                }
                                                className="pr-4 text-[#617589] transition-colors hover:text-primary"
                                            >
                                                {showPass ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>

                                    {/* Thanh độ mạnh mật khẩu */}
                                    <div className="mt-2 flex h-1 gap-1">
                                        {[1, 2, 3, 4].map((level) => (
                                            <div
                                                key={level}
                                                className={`flex-1 rounded-full transition-colors duration-300 ${
                                                    strength >= level
                                                        ? 'bg-green-500'
                                                        : 'bg-slate-200 dark:bg-slate-700'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Confirm Password Field */}
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-[#111418] dark:text-slate-200">
                                        Xác nhận mật khẩu mới
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative flex w-full items-center rounded-lg border border-[#dbe0e6] bg-white focus-within:border-primary focus-within:ring-1 focus-within:ring-primary dark:border-slate-700 dark:bg-slate-800">
                                            <div className="flex items-center justify-center pl-4 text-slate-400">
                                                <CheckCircle className="h-5 w-5" />
                                            </div>
                                            <Input
                                                type={
                                                    showConfirm
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                placeholder="••••••••"
                                                className="h-12 flex-1 border-none bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirm(!showConfirm)
                                                }
                                                className="pr-4 text-[#617589] transition-colors hover:text-primary"
                                            >
                                                {showConfirm ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Submit Button */}
                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex h-12 w-full items-center justify-center gap-2 bg-primary text-base font-bold shadow-md hover:bg-blue-600"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <>
                                        <span className="truncate">
                                            Cập nhật mật khẩu
                                        </span>
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>

                {/* Back Link */}
                <div className="flex justify-center">
                    <Link
                        href="/login"
                        className="group flex items-center gap-1 rounded-md px-4 py-2 text-sm font-medium text-[#617589] transition-colors hover:bg-slate-50 hover:text-primary dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Quay lại Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    )
}
