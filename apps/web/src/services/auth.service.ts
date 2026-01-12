import http from '@/lib/http'
import { LoginResponse } from '@/types/auth'
import { z } from 'zod'

// Định nghĩa Schema validate đầu vào (khớp với React Hook Form sau này)
export const loginSchema = z.object({
    username: z.string().min(1, 'Vui lòng nhập tài khoản'),
    password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

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
}
