export interface User {
    id: number
    tenant_id: number
    username: string
    email: string
    full_name: string
    role: 'admin' | 'staff'
    is_active: boolean
    created_at: string
}

export interface RegisterInput {
    tenant_name?: string
    username: string
    email: string
    password: string
    full_name: string
}

export interface LoginResponse {
    token: string
    user: User
}

// Kiểu dữ liệu lỗi trả về từ Backend
export interface ApiError {
    error: string
}
