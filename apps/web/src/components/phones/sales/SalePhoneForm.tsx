'use client'

import { useState, useEffect } from 'react'
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
import PhoneSearchSelect from '../PhoneSearchSelect'
import { phoneService } from '@/services/phone.service'

interface Props {
    onSuccess: (printData?: { phone: any; invoiceId: number }) => void
    onCancel: () => void
}

export default function SalePhoneForm({ onSuccess, onCancel }: Props) {
    const [isLoading, setIsLoading] = useState(false)
    const [selectedPhonePrice, setSelectedPhonePrice] = useState<number | null>(null)
    const [selectedPhoneName, setSelectedPhoneName] = useState<string>('Điện thoại')

    const { toast } = useToast()

    const form = useForm<SaleFormValues>({
        resolver: zodResolver(salePhoneSchema),
        defaultValues: defaultSaleValues,
    })

    const watchActualPrice = form.watch('actual_sale_price')
    const discountAmount = selectedPhonePrice && watchActualPrice ? selectedPhonePrice - Number(watchActualPrice) : 0
    const paymentStatus = form.watch('payment_status')

    useEffect(() => {
        if (paymentStatus === 'DRAFT') {
            form.setValue('create_invoice', false)
        }
    }, [paymentStatus, form])

    // --- LOGIC TÌM KIẾM MÁY ---
    const handleSelectPhone = (phone: Phone) => {
        form.setValue('phone_id', phone.id, { shouldValidate: true })
        
        // Bóc tách Màu sắc và Dung lượng (như đã bàn luận trước đó)
        const color = phone.details?.color || ''
        const storage = phone.details?.storage || ''
        const ram = phone.details?.ram || ''

        const memoryInfo = [ram, storage].filter(Boolean).join(' / ')
        const extraInfo = [color, memoryInfo].filter(Boolean).join(' - ')
        const displayName = extraInfo ? `${phone.model_name} (${extraInfo})` : phone.model_name
        
        setSelectedPhoneName(displayName)

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
            // 1. Lấy trạng thái từ Select (Không phụ thuộc Toggle nữa)
            const invoiceStatus = values.payment_status

            // 2. [GIỮ NGUYÊN LOGIC CỦA BẠN] Tạo Note thông tin khách hàng
            const customerInfoNote = `\n--- THÔNG TIN KHÁCH HÀNG ---\nTên: ${values.customer_name || 'Khách lẻ'}\nSĐT: ${values.customer_phone || '---'}\nCCCD: ${values.customer_id_number || '---'}\nHTTT: ${values.payment_method}`

            // 3. [GIỮ NGUYÊN LOGIC CỦA BẠN] Map dữ liệu payload
            const payload = {
                type: 'SALE',
                status: invoiceStatus, // Dùng thẳng status từ Select
                payment_method: values.payment_method,
                
                // Trả lại logic tính discount
                discount: discountAmount > 0 ? discountAmount : 0,

                customer_name: values.customer_name,
                customer_phone: values.customer_phone,
                customer_id_number: values.customer_id_number,

                // Trả lại logic cộng Note
                note: (values.note || '') + customerInfoNote,
                items: [
                    {
                        item_type: 'PHONE',
                        phone_id: values.phone_id,
                        description: selectedPhoneName || 'Điện thoại',
                        quantity: 1,
                        
                        // Trả lại logic bảo toàn giá niêm yết
                        unit_price: selectedPhonePrice || Number(values.actual_sale_price),
                        
                        // Xử lý tháng bảo hành
                        warranty_months: Number(values.warranty) || 0,
                    },
                ],
            }

            // 4. Gọi API
            const invoiceRes = await invoiceService.create(payload as any)

            // 5. [LOGIC MỚI] KÍCH HOẠT MODAL IN HOÁ ĐƠN
            if (values.create_invoice && invoiceStatus === 'PAID') {
                toast({ 
                    title: 'Thành công', 
                    description: 'Đã xuất kho và chốt hoá đơn thanh toán.', 
                    variant: 'default' 
                })
                
                // Fetch lại máy để in
                const newPhone = await phoneService.getDetail(values.phone_id)
                
                // Bắn ra ngoài cho Preview Modal nảy lên
                onSuccess({ 
                    phone: newPhone, 
                    invoiceId: invoiceRes.invoice_id 
                })
            } else {
                toast({ 
                    title: 'Thành công', 
                    description: invoiceStatus === 'PAID' ? 'Đã xuất kho thành công.' : 'Đã tạo hoá đơn nháp.',
                    variant: 'default' 
                })
                // Không in thì đóng Modal bán máy bình thường
                onSuccess() 
            }

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error.response?.data?.error || 'Không thể bán máy',
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
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <FormField
                                control={form.control}
                                name="customer_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelClass}>
                                            Họ tên
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Khách lẻ"
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
                                            Số điện thoại
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
                            <FormField
                                control={form.control}
                                name="customer_id_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelClass}>
                                            Số CCCD
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="12 số CCCD..."
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
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <div className="space-y-1.5">
                                    <label className="mb-1 block text-xs font-medium uppercase text-slate-500">
                                        Giá bán niêm yết
                                    </label>
                                    <div className="h-9 flex items-center px-3 rounded-lg border border-slate-200 bg-slate-100/50 text-sm font-bold text-slate-600 shadow-sm">
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
                                                        className="h-9 text-sm pr-10 font-bold text-primary"
                                                    />
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-bold text-slate-400">
                                                        ₫
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                            
                                            {discountAmount > 0 && (
                                                <div className="text-[11px] font-bold text-emerald-600 mt-1.5 flex items-center gap-1.5">
                                                    <span className="bg-emerald-100/60 px-1.5 py-0.5 rounded uppercase tracking-wider">Đã giảm</span>
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}
                                                </div>
                                            )}
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
                                                    <SelectItem value="0">Không bảo hành</SelectItem>
                                                    <SelectItem value="3">3 tháng</SelectItem>
                                                    <SelectItem value="6">6 tháng</SelectItem>
                                                    <SelectItem value="12">12 tháng</SelectItem>
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
                                                <SelectTrigger className={inputClass}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="CASH">Tiền mặt</SelectItem>
                                                <SelectItem value="TRANSFER">Chuyển khoản</SelectItem>
                                                <SelectItem value="CARD">Quẹt thẻ</SelectItem>
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
                                                <SelectTrigger className={inputClass}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PAID">Đã thanh toán</SelectItem>
                                                <SelectItem value="DRAFT">Chờ thanh toán</SelectItem>
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

                {/* FOOTER */}
                <div className="flex items-center justify-between rounded-b-xl border-t border-slate-200 bg-slate-50 px-6 py-4">
                    {paymentStatus === 'PAID' && (
                        <FormField
                            control={form.control}
                            name="create_invoice"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="data-[state=checked]:bg-primary"
                                        />
                                    </FormControl>
                                    <FormLabel className="cursor-pointer text-sm font-semibold text-slate-700">
                                        Tạo và in hoá đơn
                                    </FormLabel>
                                </FormItem>
                            )}
                        />
                    )}

                    <div className="ml-auto flex items-center gap-3">
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