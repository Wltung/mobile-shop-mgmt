'use client'

import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Check } from 'lucide-react'

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
import { Switch } from '@/components/ui/switch'

import { salePhoneSchema, SaleFormValues, defaultSaleValues } from './schema'
import { invoiceService } from '@/services/invoice.service'
import { useToast } from '@/hooks/use-toast'
import { Phone } from '@/types/phone'
import PhoneSearchSelect from './PhoneSearchSelect'

interface Props {
    onSuccess: () => void
    onCancel: () => void
}

export default function SalePhoneForm({ onSuccess, onCancel }: Props) {
    const [isLoading, setIsLoading] = useState(false)
    const [selectedPhonePrice, setSelectedPhonePrice] = useState<number | null>(null)

    const { toast } = useToast()

    const form = useForm<SaleFormValues>({
        resolver: zodResolver(salePhoneSchema),
        defaultValues: defaultSaleValues,
    })

    // --- LOGIC TÌM KIẾM MÁY ---
    const handleSelectPhone = (phone: Phone) => {
        // 1. Cập nhật ID máy vào form
        form.setValue('phone_id', phone.id, { shouldValidate: true })

        // 2. Tự động điền giá bán nếu có
        if (phone.sale_price) {
            form.setValue('actual_sale_price', String(phone.sale_price))
            setSelectedPhonePrice(phone.sale_price)
        } else {
            setSelectedPhonePrice(null)
        }
    }

    // --- SUBMIT FORM ---
    const onSubmit: SubmitHandler<SaleFormValues> = async (values) => {
        setIsLoading(true)
        try {
            // LOGIC TRẠNG THÁI HOÁ ĐƠN:
            // 1. create_invoice = FALSE (Tắt nút tạo) -> Status = DRAFT
            // 2. create_invoice = TRUE nhưng payment_status = DRAFT -> Status = DRAFT
            // 3. Chỉ khi create_invoice = TRUE và payment_status = PAID -> Status = PAID
            const finalStatus =
                values.create_invoice && values.payment_status === 'PAID'
                    ? 'PAID'
                    : 'DRAFT'

            const customerInfoNote = `\n--- THÔNG TIN KHÁCH HÀNG ---\nTên: ${values.customer_name}\nSĐT: ${values.customer_phone}\nHTTT: ${values.payment_method}`

            // Payload gửi lên API
            const payload = {
                type: 'SALE',
                status: finalStatus,
                payment_method: values.payment_method,

                // --- GỬI THÔNG TIN ĐỂ BE TỰ XỬ LÝ (KHÔNG CONFLICT) ---
                customer_name: values.customer_name,
                customer_phone: values.customer_phone,
                // customer_id: null, // Để null để kích hoạt logic tìm/tạo bên BE

                note: (values.note || '') + customerInfoNote,
                items: [
                    {
                        item_type: 'PHONE',
                        phone_id: values.phone_id,
                        description: 'Điện thoại',
                        quantity: 1,
                        unit_price: Number(values.actual_sale_price),
                        warranty_months: Number(values.warranty),
                    },
                ],
            }

            await invoiceService.create(payload as any)

            toast({
                title: 'Thành công',
                description: 'Đã tạo hoá đơn bán hàng.',
            })
            onSuccess()
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description:
                    error.response?.data?.error || 'Không thể tạo hoá đơn.',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const inputClass =
        'h-10 rounded-lg border-slate-300 focus:border-primary focus:ring-primary shadow-sm'
    const labelClass = 'text-sm font-medium text-slate-700 mb-1 block'

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex h-full flex-col"
            >
                <div className="max-h-[70vh] flex-1 space-y-6 overflow-y-auto p-6">
                    {/* SECTION 1: KHÁCH HÀNG */}
                    <section>
                        <h4 className="mb-4 border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-wider text-primary">
                            Thông tin khách hàng
                        </h4>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="customer_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelClass}>
                                            Họ tên khách hàng{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Nhập tên khách hàng"
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
                                name="customer_phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelClass}>
                                            Số điện thoại{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="09xxxxxx"
                                                {...field}
                                                className={inputClass}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </section>

                    {/* SECTION 2: MÁY BÁN */}
                    <section>
                        <h4 className="mb-4 border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-wider text-primary">
                            Thông tin máy bán
                        </h4>
                        <div className="space-y-4">
                            {/* --- THAY THẾ TOÀN BỘ LOGIC SEARCH CŨ BẰNG COMPONENT NÀY --- */}
                            <FormField
                                control={form.control}
                                name="phone_id"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <PhoneSearchSelect
                                                label="Tìm máy (IMEI hoặc Đời máy)"
                                                onSelect={handleSelectPhone}
                                                error={fieldState.error?.message}
                                            />
                                        </FormControl>
                                        {/* Không cần FormMessage ở đây vì component đã handle hiển thị error */}
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium uppercase text-slate-500">
                                        Giá bán niêm yết
                                    </label>
                                    <div className="py-2 text-sm font-bold text-slate-900">
                                        {selectedPhonePrice
                                            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedPhonePrice)
                                            : '--'}
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="actual_sale_price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block mb-1 text-xs font-medium uppercase text-slate-700">
                                                Giá bán thực tế
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        placeholder="0"
                                                        className="h-9 text-sm"
                                                    />
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-bold text-slate-500">
                                                        ₫
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="warranty"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block mb-1 text-xs font-medium uppercase text-slate-700">
                                                Bảo hành
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-9 text-sm">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="0">
                                                        Không bảo hành
                                                    </SelectItem>
                                                    <SelectItem value="3">
                                                        3 tháng</SelectItem>
                                                    <SelectItem value="6">
                                                        6 tháng
                                                    </SelectItem>
                                                    <SelectItem value="12">
                                                        12 tháng
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3: THANH TOÁN */}
                    <section>
                        <h4 className="mb-4 border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-wider text-primary">
                            Thanh toán
                        </h4>
                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="payment_method"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelClass}>
                                            Hình thức thanh toán
                                        </FormLabel>
                                        <Select
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
                                                <SelectItem value="CASH">
                                                    Tiền mặt
                                                </SelectItem>
                                                <SelectItem value="TRANSFER">
                                                    Chuyển khoản
                                                </SelectItem>
                                                <SelectItem value="CARD">
                                                    Quẹt thẻ
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="payment_status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelClass}>
                                            Trạng thái thanh toán
                                        </FormLabel>
                                        <Select
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
                                                <SelectItem value="PAID">
                                                    Đã thanh toán
                                                </SelectItem>
                                                <SelectItem value="DRAFT">
                                                    Chờ thanh toán
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelClass}>
                                        Ghi chú
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Ghi chú thêm về đơn hàng..."
                                            {...field}
                                            className="rounded-lg border-slate-300 shadow-sm focus:border-primary focus:ring-primary"
                                            rows={2}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </section>
                </div>

                {/* FOOTER: Chứa Create Invoice Toggle và Buttons */}
                <div className="flex items-center justify-between rounded-b-xl border-t border-slate-200 bg-slate-50 px-6 py-4">
                    {/* 1. TẠO HOÁ ĐƠN */}
                    <FormField
                        control={form.control}
                        name="create_invoice"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <FormLabel className="cursor-pointer text-sm font-semibold text-slate-700">
                                    Tạo hoá đơn
                                </FormLabel>
                            </FormItem>
                        )}
                    />

                    {/* 2. BUTTONS */}
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="h-10 border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-10 bg-primary font-bold text-white shadow-md hover:bg-blue-700"
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Check className="mr-2 h-4 w-4" />
                            )}
                            Xác nhận bán
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}
