import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types/auth'
import { authService } from '@/services/auth.service'

interface AuthState {
    user: User | null
    token: string | null
    isAuth: boolean

    // Actions
    login: (user: User, token: string) => void
    logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuth: false,

            login: (user, token) => {
                // Lưu vào state
                set({ user, token, isAuth: true })
            },

            logout: async () => {
                try {
                    // 1. Gọi API để xóa Cookie
                    await authService.logout()
                } catch (error) {
                    console.error('Logout error:', error)
                    // Vẫn tiếp tục xóa state dù API lỗi để user thoát ra được
                }

                // 2. Xóa state Client
                set({ user: null, isAuth: false })

                // 3. Xóa cache của React Query hoặc các state khác nếu có (Optional)
            },
        }),
        {
            name: 'auth-storage', // Tên key trong localStorage
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuth: state.isAuth,
            }), // Chỉ lưu những field này
        },
    ),
)
