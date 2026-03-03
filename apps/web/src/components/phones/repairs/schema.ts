import * as z from 'zod'

// --- SCHEMA DÙNG CHUNG ---
export const repairBaseSchema = z.object({
    // --- THÔNG TIN KHÁCH HÀNG ---
    customer_name: z.string().min(1, 'Vui lòng nhập họ tên khách hàng'),
    customer_phone: z
        .string()
        .min(1, 'Vui lòng nhập số điện thoại')
        .regex(/^[0-9]+$/, 'Số điện thoại chỉ được chứa số')
        .min(10, 'Số điện thoại không hợp lệ'),

    // --- THÔNG TIN THIẾT BỊ ---
    device_name: z.string().min(1, 'Vui lòng nhập đời máy'),
    imei: z.string().optional(),
    color: z.string().optional(),

    // --- TÌNH TRẠNG TIẾP NHẬN ---
    description: z.string().min(1, 'Vui lòng nhập mô tả lỗi'),
    accessories: z.string().optional(),
    device_password: z.string().optional(),

    // --- DỊCH VỤ & CHI PHÍ ---
    // Xử lý giá tiền: Cho phép rỗng, nếu nhập phải là số >= 0
    part_cost: z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Number(val)), {
            message: 'Tiền linh kiện phải là số',
        })
        .refine((val) => !val || Number(val) >= 0, {
            message: 'Tiền linh kiện không được âm',
        }),

    repair_price: z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Number(val)), {
            message: 'Tiền công phải là số',
        })
        .refine((val) => !val || Number(val) >= 0, {
            message: 'Tiền công không được âm',
        }),

    appointment_date: z.string().optional(),
    discount: z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Number(val)), {
            message: 'Giảm giá phải là số',
        }),
    has_labor_warranty: z.boolean(),
})

// --- SCHEMA TẠO MỚI (Thêm switch In phiếu) ---
export const createRepairSchema = repairBaseSchema.extend({
    create_receipt: z.boolean(),
    is_warranty: z.boolean()
})

// --- SCHEMA CẬP NHẬT (Thêm status cho form Edit sau này) ---
export const editRepairSchema = repairBaseSchema.extend({
    status: z.enum([
        'PENDING',
        'REPAIRING',
        'WAITING_CUSTOMER',
        'COMPLETED',
    ]),
    repair_type: z.enum(['NORMAL', 'WARRANTY']),
    technical_note: z.string().optional(),
    parts: z.array(z.object({
        name: z.string().min(1, 'Nhập tên'),
        price: z.string().refine((val) => !isNaN(Number(val)), { message: 'Phải là số' }),
        warranty: z.string().refine((val) => !isNaN(Number(val)), { message: 'Phải là số' })
    })),
})

// --- XUẤT TYPE CHO FORM ---
export type CreateRepairValues = z.infer<typeof createRepairSchema>
export type EditRepairValues = z.infer<typeof editRepairSchema>

// --- GIÁ TRỊ MẶC ĐỊNH ---
export const defaultCreateRepairValues: CreateRepairValues = {
    customer_name: '',
    customer_phone: '',
    device_name: '',
    imei: '',
    color: '',
    description: '',
    accessories: '',
    device_password: '',
    part_cost: '',
    repair_price: '',
    appointment_date: '',
    create_receipt: true, // Mặc định bật theo UI
    is_warranty: false,
    discount: '0',
    has_labor_warranty: false,
}