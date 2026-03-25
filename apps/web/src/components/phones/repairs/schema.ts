import * as z from 'zod'

export const repairBaseSchema = z.object({
    customer_name: z.string().optional(),
    customer_phone: z.string().optional().refine((val) => !val || /^[0-9]{10,}$/.test(val), { message: 'Số điện thoại không hợp lệ' }),
    phone_id: z.number().optional(),
    device_name: z.string().min(1, 'Vui lòng nhập đời máy'),
    imei: z.string().optional(),
    color: z.string().optional(),
    repair_category: z.enum(['SHOP_DEVICE_REPAIR', 'CUSTOMER_DEVICE_REPAIR']),
    fault: z.string().min(1, 'Vui lòng nhập mô tả lỗi'),
    accessories: z.string().optional(),
    device_password: z.string().optional(),
    
    // MẢNG LINH KIỆN DÙNG CHUNG CHO CẢ TẠO VÀ SỬA
    parts: z.array(z.object({
        name: z.string().min(1, 'Nhập tên'),
        price: z.string().refine((val) => !isNaN(Number(val)), { message: 'Phải là số' }),
        warranty: z.string().refine((val) => !isNaN(Number(val)), { message: 'Phải là số' })
    })),

    repair_price: z.string().optional().refine((val) => !val || !isNaN(Number(val)), { message: 'Tiền công phải là số' }).refine((val) => !val || Number(val) >= 0, { message: 'Tiền công không được âm' }),
    appointment_date: z.string().optional(),
    discount: z.string().optional().refine((val) => !val || !isNaN(Number(val)), { message: 'Giảm giá phải là số' }),
    has_labor_warranty: z.boolean(),
})

export const createRepairSchema = repairBaseSchema.extend({
    create_appointment: z.boolean()
})

export const editRepairSchema = repairBaseSchema.extend({
    status: z.enum(['PENDING', 'REPAIRING', 'WAITING_CUSTOMER', 'COMPLETED']),
    technical_note: z.string().optional(),
})

export type CreateRepairValues = z.infer<typeof createRepairSchema>
export type EditRepairValues = z.infer<typeof editRepairSchema>

export const defaultCreateRepairValues: CreateRepairValues = {
    customer_name: '',
    customer_phone: '',
    device_name: '',
    imei: '',
    color: '',
    fault: '',
    accessories: '',
    device_password: '',
    parts: [], 
    repair_price: '',
    appointment_date: '',
    create_appointment: false,
    repair_category: 'CUSTOMER_DEVICE_REPAIR',
    discount: '0',
    has_labor_warranty: false,
}