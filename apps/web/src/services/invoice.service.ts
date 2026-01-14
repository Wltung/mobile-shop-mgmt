// apps/web/src/services/invoice.service.ts
import http from '@/lib/http';
import { CreateInvoiceRequest, CreateInvoiceResponse } from '@/types/invoice';

export const invoiceService = {
    // API Tạo hóa đơn
    create: async (data: CreateInvoiceRequest): Promise<CreateInvoiceResponse> => {
        const response = await http.post<CreateInvoiceResponse>('/invoices', data);
        return response.data;
    },

    // (Sau này có thể thêm getDetail, getList...)
    getDetail: async (id: number) => {
        const response = await http.get(`/invoices/${id}`);
        return response.data;
    }
};