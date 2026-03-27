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

    getSales: async (params: PhoneFilterParams): Promise<PhoneListResponse> => {
        const response = await http.get<PhoneListResponse>('/phones/sales', {
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

    update: async (id: number, data: any) => {
        // Gọi method PUT lên backend (Bạn cần bổ sung backend sau)
        const response = await http.patch<{ message: string }>(
            `/phones/${id}`,
            data,
        )
        return response.data
    },

    delete: async (id: number) => {
        const response = await http.delete<{ message: string }>(`/phones/${id}`)
        return response.data
    },
}
