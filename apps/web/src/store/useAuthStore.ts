import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types/auth'

interface AuthState {
    user: User | null
    token: string | null
    isAuth: boolean

    // Actions
    login: (user: User, token: string) => void
    logout: () => void
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
                // Lưu token ra ngoài để Axios interceptor đọc được
                localStorage.setItem('token', token)
            },

            logout: () => {
                set({ user: null, token: null, isAuth: false })
                localStorage.removeItem('token')
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
