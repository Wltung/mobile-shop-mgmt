import * as z from 'zod'
import { Phone } from '@/types/phone'

interface Props {
    phone: Phone
}

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
        .min(1, 'Vui lòng nhập giá nhập') // Bắt buộc nhập (không được rỗng)
        .refine((val) => !isNaN(Number(val)), {
            message: 'Giá nhập phải là số',
        }) // Phải là số
        .refine((val) => Number(val) >= 0, { message: 'Giá không được âm' }),

    purchase_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
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
})

export const importPhoneSchema = phoneBaseSchema
    .extend({
        create_invoice: z.boolean(),
    })
    .superRefine((data, ctx) => {
        // Chỉ validate khi checkbox được chọn
        if (data.create_invoice) {
            // 1. Bắt buộc nhập Họ tên người bán
            if (!data.seller_name || data.seller_name.trim() === '') {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Vui lòng nhập họ tên người bán để xuất hoá đơn',
                    path: ['seller_name'],
                })
            }

            // 2. Bắt buộc nhập ít nhất 1 trong 2: SĐT hoặc CCCD
            const hasPhone =
                data.seller_phone && data.seller_phone.trim() !== ''
            const hasID = data.seller_id && data.seller_id.trim() !== ''

            if (!hasPhone && !hasID) {
                // Báo lỗi vào cả 2 trường để hiển thị đỏ lên
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Cần nhập SĐT hoặc CCCD',
                    path: ['seller_phone'],
                })
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Cần nhập SĐT hoặc CCCD',
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
