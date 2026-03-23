import * as z from 'zod'

export const phoneBaseSchema = z.object({
    // --- THÔNG TIN CƠ BẢN ---
    model_name: z.string().min(1, 'Vui lòng nhập đời máy'),
    imei: z
        .string()
        .length(15, 'IMEI phải có đúng 15 số')
        .regex(/^\d+$/, 'IMEI chỉ được chứa số'),
    status: z.enum(['IN_STOCK', 'REPAIRING', 'SOLD']),

    // Xử lý giá tiền: Chuyển string sang number, chặn số âm
    purchase_price: z
        .string()
        .min(1, 'Vui lòng nhập giá nhập')
        .refine((val) => !isNaN(Number(val)), {
            message: 'Giá nhập phải là số',
        })
        .refine((val) => Number(val) >= 0, { message: 'Giá không được âm' }),

    purchase_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Ngày nhập không hợp lệ',
    }),

    sale_price: z
        .string()
        .optional()
        .refine((val) => !isNaN(Number(val)), {
            message: 'Giá bán phải là số',
        })
        .refine((val) => Number(val) >= 0, { message: 'Giá không được âm' }),

    // --- THÔNG TIN NGƯỜI BÁN & THANH TOÁN ---
    seller_name: z.string().optional(),
    seller_phone: z.string().optional(),
    seller_id: z.string().optional(), // CCCD
    payment_method: z.string().optional(), // Thêm trường phương thức thanh toán

    // --- CHI TIẾT MÁY (OPTIONAL) ---
    color: z.string().optional(),
    ram: z.string().optional(),
    storage: z.string().optional(),
    appearance: z.string().optional(),
    battery: z.string().optional(),
    accessories: z.array(z.string()).optional(),

    // --- GHI CHÚ ---
    note: z.string().optional(),
})

export const importPhoneSchema = phoneBaseSchema
    .extend({
        create_invoice: z.boolean(),
    })
    .superRefine((data, ctx) => {
        // Chỉ validate khi checkbox "Tạo hoá đơn nhập hàng" được chọn
        if (data.create_invoice) {
            // 1. Bắt buộc nhập Họ tên
            if (!data.seller_name || data.seller_name.trim() === '') {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Vui lòng nhập họ tên người bán',
                    path: ['seller_name'],
                })
            }

            // 2. Bắt buộc nhập SĐT
            if (!data.seller_phone || data.seller_phone.trim() === '') {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Vui lòng nhập số điện thoại',
                    path: ['seller_phone'],
                })
            }

            // 3. Bắt buộc nhập CCCD
            if (!data.seller_id || data.seller_id.trim() === '') {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Vui lòng nhập CCCD (Bắt buộc khi nhập máy)',
                    path: ['seller_id'],
                })
            }
        }
    })

export const editPhoneSchema = phoneBaseSchema

// Xuất type ra để Form dùng
export type ImportFormValues = z.infer<typeof importPhoneSchema>

export type EditFormValues = z.infer<typeof editPhoneSchema>

export const defaultImportValues: ImportFormValues = {
    model_name: '',
    imei: '',
    status: 'IN_STOCK',
    purchase_price: '',
    purchase_date: new Date().toISOString().split('T')[0],
    sale_price: '',
    seller_name: '',
    seller_phone: '',
    seller_id: '',
    payment_method: 'CASH', // Set default
    color: '',
    ram: '',
    storage: '',
    appearance: '',
    accessories: [],
    note: '',
    battery: '',
    create_invoice: false,
}