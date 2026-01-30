// src/components/sales/schema.ts
import * as z from 'zod'

export const salePhoneBase = z.object({
    // --- KHÁCH HÀNG ---
    customer_name: z.string().min(1, 'Vui lòng nhập tên khách hàng'),
    customer_phone: z
        .string()
        .min(1, 'Vui lòng nhập số điện thoại')
        .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/g, 'Số điện thoại không hợp lệ'),

    // --- MÁY BÁN ---
    phone_id: z.number().positive('Vui lòng nhập đời máy hoặc imei'),

    // --- THANH TOÁN ---
    actual_sale_price: z
        .string()
        .min(1, 'Nhập giá bán')
        .refine((val) => !isNaN(Number(val)), 'Giá phải là số')
        .refine((val) => Number(val) >= 0, 'Giá không được âm'),

    warranty: z.string(), // "6_MONTHS", "12_MONTHS"

    payment_method: z.string(), // "CASH", "TRANSFER", "CARD"
    payment_status: z.enum(['PAID', 'DRAFT']), // Đã thanh toán / Chờ thanh toán

    note: z.string().optional(),
})

export const salePhoneSchema = salePhoneBase
    .extend({
        create_invoice: z.boolean(),
    })

export const editSaleSchema = salePhoneBase
    .extend({
        // Thêm trường ngày bán (datetime string từ input type="datetime-local")
        sale_date: z.string().optional(),
        customer_id_number: z.string().optional(),
    })

export type SaleFormValues = z.infer<typeof salePhoneSchema>
export type EditSaleFormValues = z.infer<typeof editSaleSchema>

export const defaultSaleValues: SaleFormValues = {
    customer_name: '',
    customer_phone: '',
    phone_id: 0,
    actual_sale_price: '',
    warranty: '6', // Mặc định 6 tháng
    payment_method: 'CASH',
    payment_status: 'PAID',
    note: '',
    create_invoice: true,
}
