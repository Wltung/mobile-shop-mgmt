// apps/web/src/services/warranty.service.ts
import http from '@/lib/http'
import { WarrantyFilterParams, WarrantyListResponse, Warranty } from '@/types/warranty'

export const warrantyService = {
    getAll: async (params: WarrantyFilterParams): Promise<WarrantyListResponse> => {
        const response = await http.get<WarrantyListResponse>('/warranties', { params })
        return response.data
    },

    getDetail: async (id: number): Promise<Warranty> => {
        const response = await http.get<{ data: Warranty }>(`/warranties/${id}`)
        return response.data.data
    },

    create: async (data: any) => {
        const response = await http.post<{ message: string; id: number }>('/warranties', data)
        return response.data
    },

    update: async (id: number, data: any) => {
        const response = await http.patch<{ message: string }>(`/warranties/${id}`, data)
        return response.data
    },

    searchEligible: async (params: { keyword: string, type: 'SALE' | 'REPAIR' }) => {
        const response = await http.get<{ data: any[] }>('/warranties/search', { params })
        return response.data
    },

    delete: async (id: number) => {
        const response = await http.delete<{ message: string }>(`/warranties/${id}`)
        return response.data
    },
}