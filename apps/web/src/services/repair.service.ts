// apps/web/src/services/repair.service.ts
import http from '@/lib/http'
import { CreateRepairResponse, Repair, RepairFilterParams, RepairListResponse } from '@/types/repair'

// ----------------------------------------------------

export const repairService = {
    // Lấy danh sách phiếu sửa chữa (kèm filter, phân trang)
    getAll: async (params: RepairFilterParams): Promise<RepairListResponse> => {
        const response = await http.get<RepairListResponse>('/repairs', {
            params,
        })
        return response.data
    },

    // Tạo phiếu nhận máy mới
    create: async (data: any): Promise<CreateRepairResponse> => {
        const response = await http.post<CreateRepairResponse>('/repairs', data)
        return response.data
    },

    // Hàm lấy chi tiết phiếu sửa
    getDetail: async (id: number): Promise<Repair> => {
        const response = await http.get<{ data: Repair }>(`/repairs/${id}`)
        return response.data.data // Backend trả về { message: "...", data: { ... } }
    },

    // Cập nhật thông tin phiếu sửa (Báo giá, tình trạng,...)
    update: async (id: number, data: any) => {
        const response = await http.patch<{ message: string }>(
            `/repairs/${id}`,
            data,
        )
        return response.data
    },

    complete: async (id: number) => {
        // [SỬA LẠI Ở ĐÂY]: Dùng http thay vì axiosInstance
        const response = await http.post<{ message: string; invoice_id: number }>(`/repairs/${id}/complete`)
        return response.data
    },
}