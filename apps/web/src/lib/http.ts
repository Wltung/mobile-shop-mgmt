import axios from 'axios'

const http = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL, // Đọc từ .env.local
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
})

// Response Interceptor: Chỉ để xử lý khi Token hết hạn (401)
http.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // Nếu lỗi 401
        if (error.response?.status === 401) {
            // KIỂM TRA QUAN TRỌNG:
            // Nếu API bị lỗi chính là API login -> Thì không redirect (để yên cho UI hiện lỗi đỏ)
            if (originalRequest.url && originalRequest.url.includes('/login')) {
                return Promise.reject(error)
            }

            // Chỉ redirect khi các API khác bị 401 (nghĩa là hết hạn session thật)
            if (typeof window !== 'undefined') {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    },
)

export default http
