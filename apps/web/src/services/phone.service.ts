// apps/web/src/services/phone.service.ts
import http from '@/lib/http';
import { Phone, PhoneListResponse } from '@/types/phone';

export const phoneService = {
  // Lấy danh sách điện thoại
  getAll: async () => {
    const response = await http.get('/phones');
    return response.data; // Trả về object { message, data: [...] }
  },

  create: async (data: any) => {
    return await http.post('/phones', data);
  }
};