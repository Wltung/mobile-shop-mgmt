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
    receive_status: z.string().optional(), // Tình trạng máy khi nhận
    customer_fault_note: z.string().min(1, 'Vui lòng nhập lỗi khách báo'), // Lỗi khách báo
    special_note: z.string().optional(), // Ghi chú đặc biệt
    warranty_condition: z.string().optional(), // Điều kiện bảo hành
    
    // Hiển thị hạn bảo hành (không gửi lên BE Create, chỉ để xem)
    warranty_expiry: z.string().optional(),
    start_date: z.string().optional(),      // Ngày xuất HD
    end_date: z.string().optional(),        // Ngày hết hạn BH
    
    create_receipt: z.boolean(), // In phiếu ngay
})

export type CreateWarrantyValues = z.infer<typeof createWarrantySchema>

export const editWarrantySchema = z.object({
    status: z.enum(['RECEIVED', 'PROCESSING', 'DONE', 'CANCELLED']),
    cost: z.string().optional(), // FE dùng string để nhập liệu dễ dàng
    
    // 4 trường bóc tách từ chuỗi
    receive_status: z.string().optional(), 
    customer_fault_note: z.string().min(1, 'Vui lòng nhập lỗi khách báo'), 
    special_note: z.string().optional(), 
    warranty_condition: z.string().optional(),
})

export type EditWarrantyValues = z.infer<typeof editWarrantySchema>

export const defaultCreateWarrantyValues: CreateWarrantyValues = {
    type: 'SALE',
    customer_name: '',
    customer_phone: '',
    device_name: '',
    imei: '',
    receive_status: '',
    customer_fault_note: '',
    special_note: '',
    warranty_condition: '',
    warranty_expiry: '',
    create_receipt: true,
}