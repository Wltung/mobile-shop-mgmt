// apps/web/src/hooks/useRegisterForm.ts
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import {
    authService,
    registerSchema,
    RegisterFormValues,
} from '@/services/auth.service'

export const useRegisterForm = () => {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            tenant_name: '',
            username: '',
            email: '',
            password: '',
            full_name: '',
        },
    })

    const onSubmit = async (values: RegisterFormValues) => {
        setIsLoading(true)
        try {
            await authService.register(values)
            toast({
                title: 'Đăng ký thành công!',
                description: 'Vui lòng đăng nhập để bắt đầu sử dụng.',
                variant: 'success',
            })
            router.push('/login')
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Lỗi đăng ký',
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