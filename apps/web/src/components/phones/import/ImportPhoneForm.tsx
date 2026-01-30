'use client'

import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import {
    importPhoneSchema,
    ImportFormValues,
    defaultImportValues,
} from './schema'
import { phoneService } from '@/services/phone.service'
import { useToast } from '@/hooks/use-toast'
import { invoiceService } from '@/services/invoice.service'

interface Props {
    onSuccess: () => void
    onCancel: () => void
}

export default function ImportPhoneForm({ onSuccess, onCancel }: Props) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const form = useForm<ImportFormValues>({
        resolver: zodResolver(importPhoneSchema),
        defaultValues: defaultImportValues,
    })

    const isCreateInvoice = form.watch('create_invoice')

    const onSubmit: SubmitHandler<ImportFormValues> = async (values) => {
        setIsLoading(true)
        try {
            const priceNumber = Number(values.purchase_price)

            const payload = {
                imei: values.imei,
                model_name: values.model_name,
                purchase_price: priceNumber,
                status: values.status,
                sale_price: Number(values.sale_price),
                note: values.note || '',
                seller_name: values.seller_name,
                seller_phone: values.seller_phone,
                seller_id: values.seller_id,
                details: {
                    color: values.color,
                    storage: values.storage,
                    battery: values.battery,
                    appearance: values.appearance,
                    purchase_date: values.purchase_date,
                    accessories: values.accessories,
                },
            }

            const res = await phoneService.create(payload)

            // 2. LUÔN TẠO HOÁ ĐƠN
            // Nếu checkbox được chọn -> PAID (Chốt sổ). Nếu không -> DRAFT (Nháp/Nợ)
            const invoiceStatus = values.create_invoice ? 'PAID' : 'DRAFT'
            
            const customerId = res.source_id

            let finalCustomerName = values.seller_name
            if (!finalCustomerName || finalCustomerName.trim() === '') {
                finalCustomerName = 'Khách vãng lai'
            }
            
            await invoiceService.create({
                type: 'IMPORT',
                status: invoiceStatus, // Sử dụng status dựa trên checkbox
                customer_id: customerId,
                customer_name: finalCustomerName, 
                customer_phone: values.seller_phone,
                payment_method: 'CASH',
                note: `Phiếu nhập kho cho ${values.model_name} (IMEI: ${values.imei})`,
                items: [
                    {
                        item_type: 'PHONE',
                        phone_id: res.phone_id,
                        description: values.model_name,
                        quantity: 1,
                        unit_price: priceNumber,
                        warranty_months: 0,
                    },
                ],
            })

            // Thông báo
            if (invoiceStatus === 'PAID') {
                toast({ title: 'Thành công', description: 'Đã nhập kho và tạo hoá đơn thanh toán.' })
            } else {
                toast({ 
                    title: 'Đã lưu nháp', 
                    description: 'Đã nhập kho. Hoá đơn ở trạng thái Nháp (có thể sửa thông tin nhập).',
                    variant: "default" // Hoặc dùng màu khác để phân biệt
                })
            }

            onSuccess()
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description:
                    error.response?.data?.error || 'Không thể nhập máy',
            })
        } finally {
            setIsLoading(false)
        }
    }

    // --- STYLE CHO INPUT ---
    const inputClass =
        'bg-slate-100 border-transparent h-11 font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus-visible:bg-white focus-visible:border-primary focus-visible:ring-0 transition-all shadow-sm'

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex h-full flex-col bg-slate-50/50"
            >
                {/* Scroll Container - Giữ nguyên max-h-[70vh] theo file bạn gửi để không mất scroll */}
                <div className="max-h-[70vh] space-y-6 overflow-y-auto px-8 py-6 pb-10">
                    {/* SECTION 1: THÔNG TIN MÁY */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-primary">
                                1
                            </div>
                            <h4 className="text-sm font-bold uppercase tracking-wide text-slate-800">
                                Thông tin máy
                            </h4>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="model_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-slate-700">
                                            Đời máy{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ví dụ: iPhone 15 Pro Max"
                                                {...field}
                                                className={inputClass}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="imei"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-slate-700">
                                            IMEI{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="15 số IMEI"
                                                maxLength={15}
                                                {...field}
                                                className={`${inputClass} font-mono`}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-slate-700">
                                            Trạng thái
                                        </FormLabel>
                                        <Select
                                            disabled={true}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger
                                                    className={inputClass}
                                                >
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="IN_STOCK">
                                                    Trong kho
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="purchase_price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-slate-700">
                                            Giá nhập{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                    className={inputClass}
                                                />
                                                <span className="absolute right-3 top-3 text-sm font-medium text-slate-500">
                                                    VND
                                                </span>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="sale_price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-slate-700">
                                            Giá bán dự kiến{' '}
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                    className={inputClass}
                                                />
                                                <span className="absolute right-3 top-3 text-sm font-medium text-slate-500">
                                                    VND
                                                </span>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="purchase_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-slate-700">
                                            Ngày nhập
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                                className={`${inputClass} block`}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* SECTION 2: NGƯỜI BÁN */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-primary">
                                2
                            </div>
                            <h4 className="text-sm font-bold uppercase tracking-wide text-slate-800">
                                Người bán
                            </h4>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <FormField
                                control={form.control}
                                name="seller_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-slate-700">
                                            Họ tên người bán
                                            {/* Hiển thị dấu * nếu đang tạo hoá đơn */}
                                            {isCreateInvoice && (
                                                <span className="ml-1 text-red-500">
                                                    *
                                                </span>
                                            )}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Nguyễn Văn A"
                                                {...field}
                                                className={inputClass}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="seller_phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-slate-700">
                                            Số điện thoại
                                            {/* Logic: Nếu tạo hóa đơn, hiện dấu * báo hiệu cần nhập (1 trong 2) */}
                                            {isCreateInvoice && (
                                                <span className="ml-1 text-red-500">
                                                    *
                                                </span>
                                            )}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="tel"
                                                placeholder="09xx..."
                                                {...field}
                                                className={inputClass}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="seller_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-slate-700">
                                            Số CCCD
                                            {/* Logic: Nếu tạo hóa đơn, hiện dấu * báo hiệu cần nhập (1 trong 2) */}
                                            {isCreateInvoice && (
                                                <span className="ml-1 text-red-500">
                                                    *
                                                </span>
                                            )}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="12 số..."
                                                {...field}
                                                className={inputClass}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* SECTION 3: CHI TIẾT KỸ THUẬT */}
                    {/* SỬA: Đổi thành grid-cols-3 theo yêu cầu */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-primary">
                                3
                            </div>
                            <h4 className="text-sm font-bold uppercase tracking-wide text-slate-800">
                                Chi tiết kỹ thuật
                            </h4>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {/* MÀU SẮC: Sửa thành Input nhập tay */}
                            <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold uppercase text-slate-500">
                                            Màu sắc
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ví dụ: Titanium Blue"
                                                {...field}
                                                className={inputClass}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="storage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold uppercase text-slate-500">
                                            Dung lượng
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger
                                                    className={inputClass}
                                                >
                                                    <SelectValue placeholder="Chọn" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {[
                                                    '64GB',
                                                    '128GB',
                                                    '256GB',
                                                    '512GB',
                                                    '1TB',
                                                ].map((s) => (
                                                    <SelectItem
                                                        key={s}
                                                        value={s}
                                                    >
                                                        {s}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="battery"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold uppercase text-slate-500">
                                            Pin (%)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="100"
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value,
                                                    )
                                                }
                                                className={inputClass}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="appearance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold uppercase text-slate-500">
                                            Ngoại quan
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger
                                                    className={inputClass}
                                                >
                                                    <SelectValue placeholder="Chọn" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="New Seal">
                                                    New Seal
                                                </SelectItem>
                                                <SelectItem value="Like New (99%)">
                                                    Like New (99%)
                                                </SelectItem>
                                                <SelectItem value="98%">
                                                    98% (Xước phẩy)
                                                </SelectItem>
                                                <SelectItem value="95%">
                                                    95% (Cấn móp)
                                                </SelectItem>
                                                <SelectItem value="Xấu">
                                                    Xấu
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* GHI CHÚ */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-bold uppercase text-slate-800">
                                        Ghi chú
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Nhập ghi chú chi tiết về tình trạng máy..."
                                            rows={3}
                                            {...field}
                                            className={inputClass}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* --- FOOTER STICKY --- */}
                <div className="sticky bottom-0 z-10 flex items-center justify-between border-t border-slate-200 bg-white px-8 py-5 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <FormField
                        control={form.control}
                        name="create_invoice"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                    <label className="group relative inline-flex cursor-pointer select-none items-center">
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                            checked={field.value}
                                            onChange={field.onChange}
                                        />
                                        <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-sidebar peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sidebar/20"></div>
                                        <span className="ml-3 text-sm font-bold text-slate-700 transition-colors group-hover:text-primary">
                                            Tạo hoá đơn nhập hàng
                                        </span>
                                    </label>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="h-10 border-slate-300 px-6 font-medium text-slate-600"
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-10 bg-sidebar px-8 font-bold text-white hover:bg-sidebar-hover"
                        >
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Xác nhận nhập kho
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}
