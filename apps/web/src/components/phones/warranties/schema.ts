// apps/web/src/components/phones/warranties/schema.ts
import * as z from 'zod'

export const createWarrantySchema = z.object({
    type: z.enum(['SALE', 'REPAIR']),
    
    phone_id: z.number().optional(),
    invoice_id: z.number().optional(),

    customer_name: z.string().min(1, 'Vui lòng chọn máy để lấy tên khách'),
    customer_phone: z.string().optional(),
    customer_id_number: z.string().optional(), // BỔ SUNG CCCD
    device_name: z.string().min(1, 'Vui lòng chọn máy'),
    imei: z.string().optional(),
    part_name: z.string().optional(),
    
    // 4 trường JSON gửi lên BE
    condition: z.string().optional(), // Tình trạng máy khi nhận
    fault: z.string().min(1, 'Vui lòng nhập lỗi khách báo'), // Lỗi khách báo
    cost: z.string().optional(),
    special_note: z.string().optional(), // Ghi chú đặc biệt
    warranty_condition: z.string().optional(), // Điều kiện bảo hành
    
    warranty_expiry: z.string().optional(),
    start_date: z.string().optional(),      
    end_date: z.string().optional(),        
    
    create_receipt: z.boolean(), 
})

export type CreateWarrantyValues = z.infer<typeof createWarrantySchema>

export const editWarrantySchema = z.object({
    status: z.enum(['RECEIVED', 'PROCESSING', 'DONE', 'CANCELLED']),
    cost: z.string().optional(), 
    
    condition: z.string().optional(), 
    fault: z.string().min(1, 'Vui lòng nhập lỗi khách báo'), 
    special_note: z.string().optional(), 
    warranty_condition: z.string().optional(),
})

export type EditWarrantyValues = z.infer<typeof editWarrantySchema>

export const defaultCreateWarrantyValues: CreateWarrantyValues = {
    type: 'SALE',
    customer_name: '',
    customer_phone: '',
    customer_id_number: '',
    device_name: '',
    imei: '',
    part_name: '',
    condition: '',
    fault: '',
    cost: '',
    special_note: '',
    warranty_condition: '',
    warranty_expiry: '',
    create_receipt: true,
}