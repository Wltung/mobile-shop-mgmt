// apps/web/src/components/auth/ForgotPasswordForm.tsx
'use client'

import Link from 'next/link'
import { Mail, ArrowLeft, Loader2, Smartphone } from 'lucide-react'
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
import { useForgotPassword } from '@/hooks/useForgotPassword'

export default function ForgotPasswordForm() {
    const { form, isLoading, onSubmit } = useForgotPassword()

    return (
        <div className="flex w-full flex-col items-center justify-center bg-white p-6 transition-colors duration-300 dark:bg-[#101922] sm:p-12 lg:w-1/2">
            <div className="flex w-full max-w-[480px] flex-col gap-8">
                {/* Mobile Logo (Chỉ hiện ở màn hình nhỏ) */}
                <div className="mb-4 flex justify-center lg:hidden">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/30">
                        <Smartphone className="h-6 w-6" />
                    </div>
                </div>

                {/* Header Section */}
                <div className="flex flex-col gap-2 text-center sm:text-left">
                    <h1 className="text-[32px] font-bold leading-tight tracking-tight text-[#111418] dark:text-white">
                        Quên mật khẩu?
                    </h1>
                    <p className="text-base font-normal leading-normal text-[#617589] dark:text-gray-400">
                        Nhập email liên kết với tài khoản của bạn để nhận hướng
                        dẫn đặt lại mật khẩu.
                    </p>
                </div>

                {/* Form Section */}
                <Form {...form}>
                    <form onSubmit={onSubmit} className="flex flex-col gap-6">
                        {/* Email Field Custom Style giống thiết kế */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-medium leading-normal text-[#111418] dark:text-gray-200">
                                        Email
                                    </FormLabel>
                                    <FormControl>
                                        <div className="group flex w-full items-stretch rounded-lg focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-1 dark:focus-within:ring-offset-[#101922]">
                                            <Input
                                                placeholder="example@mobileshop.com"
                                                className="h-14 flex-1 rounded-r-none border-r-0 border-[#dbe0e6] bg-white text-[#111418] focus-visible:ring-0 focus-visible:ring-offset-0 dark:border-gray-600 dark:bg-[#1a2632] dark:text-white"
                                                {...field}
                                            />
                                            <div className="flex items-center justify-center rounded-r-lg border border-l-0 border-[#dbe0e6] bg-white px-[15px] text-[#617589] dark:border-gray-600 dark:bg-[#1a2632] dark:text-gray-400">
                                                <Mail className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-12 w-full bg-primary text-base font-bold shadow-md shadow-blue-200 transition-colors hover:bg-blue-600 dark:shadow-none"
                        >
                            {isLoading && (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            )}
                            Gửi yêu cầu
                        </Button>

                        {/* Back to Login Link */}
                        <div className="flex justify-center pt-2">
                            <Link
                                href="/login"
                                className="group flex items-center gap-2 text-sm font-medium text-[#617589] transition-colors hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                            >
                                <ArrowLeft className="h-[18px] w-[18px] transition-transform group-hover:-translate-x-1" />
                                <span>Quay lại Đăng nhập</span>
                            </Link>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}
