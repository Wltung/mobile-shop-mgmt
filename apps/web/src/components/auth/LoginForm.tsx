'use client'

import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import Link from 'next/link'
import { useLoginForm } from '@/hooks/useLoginForm'

export default function LoginForm() {
    // Lấy logic từ Hook
    const {
        form,
        isLoading,
        showPassword,
        togglePasswordVisibility,
        onSubmit,
    } = useLoginForm()

    return (
        <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-white p-6 dark:bg-[#101922] sm:p-12 lg:p-16 xl:p-24">
            <div className="flex w-full max-w-[440px] flex-col gap-8">
                {/* Header Form */}
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-black leading-tight tracking-[-0.033em] text-[#111418] dark:text-white">
                        Welcome back
                    </h2>
                    <p className="text-base font-normal leading-normal text-[#617589] dark:text-gray-400">
                        Please enter your details to sign in.
                    </p>
                </div>

                {/* Form Context */}
                <Form {...form}>
                    <form onSubmit={onSubmit} className="flex flex-col gap-5">
                        {/* Username */}
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-[#111418] dark:text-white">
                                        Email or Username
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                placeholder="name@company.com"
                                                className="h-12 border-[#dbe0e6] pl-11 focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-[#1a2632]"
                                                {...field}
                                            />
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#617589] dark:text-gray-400">
                                                <Mail className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Password */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-[#111418] dark:text-white">
                                        Password
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={
                                                    showPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                placeholder="Enter your password"
                                                className="h-12 border-[#dbe0e6] pl-11 pr-11 focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-[#1a2632]"
                                                {...field}
                                            />
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#617589] dark:text-gray-400">
                                                <Lock className="h-5 w-5" />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={
                                                    togglePasswordVisibility
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#617589] transition-colors hover:text-primary"
                                            >
                                                {showPassword ? (
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

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="remember"
                                    className="border-gray-300 data-[state=checked]:bg-primary"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="cursor-pointer text-sm font-normal text-[#111418] hover:text-primary dark:text-white"
                                >
                                    Remember me
                                </Label>
                            </div>
                            <a
                                href="/forgot-password"
                                className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                            >
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-12 w-full rounded-lg bg-primary text-base font-bold text-white shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
                        >
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Sign In
                        </Button>
                    </form>
                </Form>

                {/* Footer */}
                <div className="mt-4 flex flex-col items-center gap-4 text-center">
                    <p className="text-sm text-[#617589] dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link
                            href="/contact"
                            className="font-medium text-primary transition-colors hover:text-primary/80"
                        >
                            Contact Admin
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
