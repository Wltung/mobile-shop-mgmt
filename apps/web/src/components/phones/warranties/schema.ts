// apps/web/src/components/phones/warranties/schema.ts
import * as z from 'zod'

export const createWarrantySchema = z.object({
    type: z.enum(['SALE', 'REPAIR']),
    
    // Các ID liên kết
    phone_id: z.number().optional(),
    invoice_id: z.number().optional(),

    // Dữ liệu bóc tách từ kết quả search
    customer_name: z.string().min(1, 'Vui lòng chọn máy để lấy tên khách'),
    customer_phone: z.string().optional(),
    device_name: z.string().min(1, 'Vui lòng chọn máy'),
    imei: z.string().optional(),
    
    // Form nhập liệu
    description: z.string().min(1, 'Vui lòng nhập tình trạng / lỗi báo bảo hành'),
    technical_note: z.string().optional(), // Ghi chú thêm (nội bộ)
    
    // Hiển thị hạn bảo hành (không gửi lên BE Create, chỉ để xem)
    warranty_expiry: z.string().optional(),
    start_date: z.string().optional(),      // Ngày xuất HD
    end_date: z.string().optional(),        // Ngày hết hạn BH
    
    create_receipt: z.boolean(), // In phiếu ngay
})

export type CreateWarrantyValues = z.infer<typeof createWarrantySchema>

export const defaultCreateWarrantyValues: CreateWarrantyValues = {
    type: 'SALE',
    customer_name: '',
    customer_phone: '',
    device_name: '',
    imei: '',
    description: '',
    technical_note: '',
    warranty_expiry: '',
    create_receipt: true,
}