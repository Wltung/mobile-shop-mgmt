'use client'

import Link from 'next/link'
import {
    User,
    Smartphone,
    Store,
    Mail,
    Send,
    MessageSquare,
    Phone,
    ArrowLeft,
    Loader2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'

import { useContactForm } from '@/hooks/auth/useContactForm'

export default function ContactForm() {
    const { form, isLoading, onSubmit } = useContactForm()

    return (
        <div className="flex h-full w-full flex-col overflow-y-auto bg-white dark:bg-[#101922] lg:w-7/12">
            <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-12 lg:px-20 lg:py-12">
                <div className="flex w-full max-w-xl flex-col gap-8">
                    {/* Header */}
                    <div className="flex flex-col gap-2">
                        <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#111418] dark:text-white">
                            Yêu cầu cấp tài khoản / Hỗ trợ
                        </h2>
                        <p className="text-base font-normal text-[#617589] dark:text-slate-400">
                            Vui lòng điền thông tin bên dưới để gửi yêu cầu hoặc
                            liên hệ trực tiếp với bộ phận kỹ thuật.
                        </p>
                    </div>

                    <Form {...form}>
                        <form
                            onSubmit={onSubmit}
                            className="flex flex-col gap-5"
                        >
                            {/* Họ tên */}
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Họ và tên</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                                                <Input
                                                    placeholder="Nhập họ tên đầy đủ"
                                                    className="h-12 pl-11"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex flex-col gap-5 sm:flex-row">
                                {/* Số điện thoại */}
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Số điện thoại</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Smartphone className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                                                    <Input
                                                        placeholder="09xxxxxxxx"
                                                        className="h-12 pl-11"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Tên cửa hàng */}
                                <FormField
                                    control={form.control}
                                    name="storeName"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Tên cửa hàng</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Store className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                                                    <Input
                                                        placeholder="Nhập tên cửa hàng"
                                                        className="h-12 pl-11"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Email */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                                                <Input
                                                    placeholder="Nhập địa chỉ email"
                                                    className="h-12 pl-11"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Lời nhắn */}
                            <FormField
                                control={form.control}
                                name="message"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Lời nhắn / Mô tả</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Mô tả vấn đề bạn đang gặp phải..."
                                                className="min-h-[100px] resize-y p-4"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="mt-2 h-12 w-full text-base font-bold shadow-md shadow-blue-200 dark:shadow-none"
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="mr-2 h-5 w-5" />
                                )}
                                Gửi yêu cầu hỗ trợ
                            </Button>
                        </form>
                    </Form>

                    {/* Footer Contact Options */}
                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-[#dbe0e6] dark:border-slate-700"></div>
                        <span className="mx-4 flex-shrink-0 text-sm font-medium text-slate-400 dark:text-slate-500">
                            Hoặc liên hệ nhanh
                        </span>
                        <div className="flex-grow border-t border-[#dbe0e6] dark:border-slate-700"></div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <button className="group flex items-center gap-4 rounded-xl border border-[#dbe0e6] bg-white p-4 text-left transition-all hover:border-primary hover:bg-primary/5 dark:border-slate-700 dark:bg-slate-800/50">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-primary transition-transform group-hover:scale-110 dark:bg-blue-900/30">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-[#111418] dark:text-white">
                                    Chat Zalo / Telegram
                                </span>
                                <span className="text-xs text-[#617589] dark:text-slate-400">
                                    Phản hồi trung bình 5 phút
                                </span>
                            </div>
                        </button>

                        <button className="group flex items-center gap-4 rounded-xl border border-[#dbe0e6] bg-white p-4 text-left transition-all hover:border-primary hover:bg-primary/5 dark:border-slate-700 dark:bg-slate-800/50">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600 transition-transform group-hover:scale-110 dark:bg-green-900/30 dark:text-green-400">
                                <Phone className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-[#111418] dark:text-white">
                                    Gọi kỹ thuật
                                </span>
                                <span className="text-xs text-[#617589] dark:text-slate-400">
                                    Hotline: 1900 xxxx (24/7)
                                </span>
                            </div>
                        </button>
                    </div>

                    <div className="mt-4 flex justify-center pb-8 lg:pb-0">
                        <Link
                            href="/login"
                            className="group flex items-center gap-2 font-medium text-slate-500 transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                            Quay lại Đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
