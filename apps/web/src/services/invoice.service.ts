// apps/web/src/services/invoice.service.ts
import http from '@/lib/http';
import { CreateInvoiceRequest, CreateInvoiceResponse, Invoice } from '@/types/invoice';

export const invoiceService = {
    // API Tạo hóa đơn
    create: async (data: CreateInvoiceRequest): Promise<CreateInvoiceResponse> => {
        const response = await http.post<CreateInvoiceResponse>('/invoices', data);
        return response.data;
    },

    // (Sau này có thể thêm getDetail, getList...)
    getDetail: async (id: number) => {
        const response = await http.get<{ data: Invoice }>(`/invoices/${id}`);
        return response.data.data;
    }
};