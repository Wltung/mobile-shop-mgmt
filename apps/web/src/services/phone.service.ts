// apps/web/src/services/phone.service.ts
import http from '@/lib/http'
import { Phone, PhoneListResponse, CreatePhoneResponse } from '@/types/phone'

export const phoneService = {
    // Lấy danh sách điện thoại
    getAll: async (page = 1, limit = 5): Promise<PhoneListResponse> => {
        const response = await http.get<PhoneListResponse>(
            `/phones?page=${page}&limit=${limit}`,
        )
        return response.data // Trả về object { message, data: [...] }
    },

    create: async (data: any) => {
        const response = await http.post<CreatePhoneResponse>('/phones', data)
        return response.data
    },
}
