import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import {
    authService,
    loginSchema,
    LoginFormValues,
} from '@/services/auth.service'
import { useAuthStore } from '@/store/useAuthStore'

export const useLoginForm = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const router = useRouter()
    const { toast } = useToast()
    const loginToStore = useAuthStore((state) => state.login)

    // 1. Khởi tạo Form với Zod
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    })

    // 2. Logic Toggle Password
    const togglePasswordVisibility = () => setShowPassword(!showPassword)

    // 3. Logic Submit Form
    const onSubmit = async (values: LoginFormValues) => {
        setIsLoading(true)
        try {
            // Gọi API
            const data = await authService.login(values)

            // Lưu Store
            loginToStore(data.user, data.token)

            toast({
                title: 'Welcome back!',
                description: 'Đăng nhập thành công.',
            })

            // Chuyển hướng
            router.push('/dashboard')
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Lỗi đăng nhập',
                description:
                    error.response?.data?.error ||
                    'Vui lòng kiểm tra lại thông tin.',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return {
        form,
        isLoading,
        showPassword,
        togglePasswordVisibility,
        onSubmit: form.handleSubmit(onSubmit),
    }
}
