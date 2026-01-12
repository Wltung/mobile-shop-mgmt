import http from '@/lib/http'
import { LoginResponse } from '@/types/auth'
import { z } from 'zod'

// Định nghĩa Schema validate đầu vào (khớp với React Hook Form sau này)
export const loginSchema = z.object({
    username: z.string().min(1, 'Vui lòng nhập tài khoản'),
    password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

// Thêm Schema validate Email
export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, 'Vui lòng nhập email')
        .email('Email không đúng định dạng'),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

// Schema validate: Mật khẩu mới + Xác nhận mật khẩu
export const resetPasswordSchema = z
    .object({
        password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
        confirmPassword: z.string().min(6, 'Vui lòng xác nhận mật khẩu'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Mật khẩu xác nhận không khớp',
        path: ['confirmPassword'],
    })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export const authService = {
    login: async (data: LoginFormValues) => {
        // Gọi API POST /login
        const response = await http.post<LoginResponse>('/login', data)
        return response.data
    },

    register: async (data: any) => {
        const response = await http.post('/register', data)
        return response.data
    },

    // Hàm lấy thông tin user (nếu cần verify token lúc load trang)
    getMe: async () => {
        // Backend chưa có API này, nhưng cấu trúc sẵn
        // const response = await http.get<User>('/me');
        // return response.data;
    },

    forgotPassword: async (email: string) => {
        // Gọi API POST /api/forgot-password
        const response = await http.post('/forgot-password', { email })
        return response.data
    },

    resetPassword: async (token: string, newPassword: string) => {
        // Gọi API POST /api/reset-password
        // Body phải khớp với struct ResetPasswordInput ở Backend
        const response = await http.post('/reset-password', {
            token,
            new_password: newPassword,
        })
        return response.data
    },
}
