import axios from 'axios'

const http = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL, // Đọc từ .env.local
    headers: {
        'Content-Type': 'application/json',
    },
})

// Interceptor: Tự động gắn Token vào mọi request nếu có
http.interceptors.request.use(
    (config) => {
        // Chúng ta sẽ lấy token từ localStorage (hoặc store)
        const token =
            typeof window !== 'undefined' ? localStorage.getItem('token') : null

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error),
)

// Interceptor: Xử lý lỗi chung (Ví dụ: Token hết hạn -> Tự logout)
http.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Logic logout sẽ xử lý ở tầng cao hơn hoặc xóa token tại đây
            if (typeof window !== 'undefined') {
                // localStorage.removeItem('token'); // Tùy chọn: Xóa token nếu lỗi 401
            }
        }
        return Promise.reject(error)
    },
)

export default http
