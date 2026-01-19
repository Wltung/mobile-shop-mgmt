// apps/web/src/services/phone.service.ts
import http from '@/lib/http'
import {
    PhoneFilterParams,
    PhoneListResponse,
    CreatePhoneResponse,
    Phone,
} from '@/types/phone'

export const phoneService = {
    // Lấy danh sách điện thoại
    getAll: async (params: PhoneFilterParams): Promise<PhoneListResponse> => {
        const response = await http.get<PhoneListResponse>('/phones', {
            params,
        })

        return response.data
    },

    create: async (data: any) => {
        const response = await http.post<CreatePhoneResponse>('/phones', data)
        return response.data
    },

    // Hàm lấy chi tiết
    getDetail: async (id: number): Promise<Phone> => {
        const response = await http.get<{ data: Phone }>(`/phones/${id}`)
        return response.data.data // Backend trả về { message: "...", data: { ... } }
    },
}
