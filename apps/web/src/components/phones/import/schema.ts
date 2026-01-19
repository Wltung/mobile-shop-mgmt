import * as z from 'zod'

export const importSchema = z.object({
    // --- THÔNG TIN CƠ BẢN ---
    model_name: z.string().min(1, 'Vui lòng chọn đời máy'),
    imei: z
        .string()
        .length(15, 'IMEI phải có đúng 15 số')
        .regex(/^\d+$/, 'IMEI chỉ được chứa số'),
    status: z.enum(['IN_STOCK', 'REPAIRING', 'SOLD']),

    // Xử lý giá tiền: Chuyển string sang number, chặn số âm
    purchase_price: z
        .string()
        .min(1, 'Vui lòng nhập giá nhập') // Bắt buộc nhập (không được rỗng)
        .refine((val) => !isNaN(Number(val)), {
            message: 'Giá nhập phải là số',
        }) // Phải là số
        .refine((val) => Number(val) >= 0, { message: 'Giá không được âm' }),

    import_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Ngày nhập không hợp lệ',
    }),

    // --- THÔNG TIN NGƯỜI BÁN ---
    seller_name: z.string().optional(),
    seller_phone: z.string().optional(),
    seller_id: z.string().optional(), // CCCD

    // --- CHI TIẾT MÁY (OPTIONAL) ---
    color: z.string().optional(),
    storage: z.string().optional(),
    appearance: z.string().optional(),
    battery: z.string().optional(),
    accessories: z.array(z.string()).optional(),

    // --- GHI CHÚ ---
    note: z.string().optional(),
    // toggle tạo hóa đơn
    create_invoice: z.boolean(),
})

// Xuất type ra để Form dùng
export type ImportFormValues = z.infer<typeof importSchema>

export const defaultImportValues: ImportFormValues = {
    model_name: '',
    imei: '',
    status: 'IN_STOCK',
    purchase_price: '',
    import_date: new Date().toISOString().split('T')[0],
    seller_name: '',
    seller_phone: '',
    seller_id: '',
    color: '',
    storage: '',
    appearance: '',
    accessories: [],
    note: '',
    battery: '',
    create_invoice: true,
}
