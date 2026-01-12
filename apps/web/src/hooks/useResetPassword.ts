// apps/web/src/hooks/useResetPassword.ts
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import {
    authService,
    resetPasswordSchema,
    ResetPasswordFormValues,
} from '@/services/auth.service'

export const useResetPassword = () => {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()

    // Lấy token từ URL (?token=...)
    const token = searchParams.get('token')

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    })

    const onSubmit = async (values: ResetPasswordFormValues) => {
        if (!token) {
            toast({
                variant: 'destructive',
                title: 'Lỗi Token',
                description:
                    'Không tìm thấy mã xác thực. Vui lòng kiểm tra lại link trong email.',
            })
            return
        }

        setIsLoading(true)
        try {
            await authService.resetPassword(token, values.password)

            toast({
                variant: 'success',
                title: 'Thành công!',
                description:
                    'Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại.',
            })

            // Chuyển về trang login
            router.push('/login')
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Đổi mật khẩu thất bại',
                description:
                    error.response?.data?.error ||
                    'Có lỗi xảy ra, vui lòng thử lại.',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return {
        form,
        isLoading,
        onSubmit: form.handleSubmit(onSubmit),
    }
}
