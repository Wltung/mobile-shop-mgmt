// apps/web/src/hooks/useForgotPassword.ts
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/hooks/use-toast'
import {
    authService,
    forgotPasswordSchema,
    ForgotPasswordFormValues,
} from '@/services/auth.service'
import { useRouter } from 'next/navigation'

export const useForgotPassword = () => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    })

    const onSubmit = async (values: ForgotPasswordFormValues) => {
        setIsLoading(true)
        try {
            await authService.forgotPassword(values.email)

            router.push('/forgot-password/sent')
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Gửi thất bại',
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
