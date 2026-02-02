'use client'

import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, Smartphone } from 'lucide-react'

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

import { phoneBaseSchema, EditFormValues, defaultImportValues } from './schema' // Tận dụng schema có sẵn
import { phoneService } from '@/services/phone.service'
import { useToast } from '@/hooks/use-toast'
import { Phone } from '@/types/phone'
import { formatDateForInput } from '@/lib/utils'

interface Props {
    phone: Phone
    onSuccess: () => void
    onCancel: () => void
}

export default function EditPhoneForm({ phone, onSuccess, onCancel }: Props) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    // Map dữ liệu từ API vào Form
    const defaultValues: Partial<EditFormValues> = {
        model_name: phone.model_name,
        imei: phone.imei,
        status: phone.status as any,
        // Convert number -> string để hiển thị trên input
        purchase_price: String(phone.purchase_price),
        purchase_date: formatDateForInput(
            phone.purchase_date || phone.created_at,
        ),
        sale_price: String(phone.sale_price),

        seller_name: phone.seller_name || '',
        seller_phone: phone.seller_phone || '',
        seller_id: phone.seller_id || '',

        color: phone.details?.color || '',
        storage: phone.details?.storage || '',
        battery: phone.details?.battery ? String(phone.details.battery) : '',
        appearance: phone.details?.appearance || '',
        note: phone.note || '',
        accessories: phone.details?.accessories || [],
    }

    const form = useForm<EditFormValues>({
        resolver: zodResolver(phoneBaseSchema),
        defaultValues: defaultValues,
    })

    const isLocked = phone.invoice_status === 'PAID'

    const onSubmit: SubmitHandler<EditFormValues> = async (values) => {
        setIsLoading(true)
        try {
            // Chuẩn bị payload gửi lên API
            const payload = {
                imei: values.imei,
                model_name: values.model_name,
                purchase_price: Number(values.purchase_price),
                status: values.status,
                note: values.note,
                purchase_date: values.purchase_date,
                sale_price: Number(values.sale_price),
                seller_name: values.seller_name,
                seller_phone: values.seller_phone,
                seller_id: values.seller_id,
                details: {
                    color: values.color,
                    storage: values.storage,
                    battery: values.battery,
                    appearance: values.appearance,
                    accessories: values.accessories,
                },
            }

            await phoneService.update(phone.id, payload)

            toast({
                title: 'Thành công',
                description: 'Đã cập nhật thông tin máy.',
            })
            onSuccess()
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description:
                    error.response?.data?.error ||
                    'Không thể cập nhật thông tin.',
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Style inputs theo code.html
    const inputClass =
        'w-full h-10 rounded-lg border-slate-300 text-slate-800 text-sm focus:border-primary focus:ring-primary shadow-sm bg-white'
    const labelClass = 'block text-sm font-semibold text-slate-700 mb-1.5'

    const disabledClass = "bg-slate-100 text-slate-500 cursor-not-allowed"

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex h-full flex-col bg-white"
            >
                <div className="max-h-[70vh] flex-1 overflow-y-auto p-6 lg:p-8">
                    {/* Hiển thị cảnh báo nếu bị khoá */}
                    {isLocked && (
                        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-700 border border-blue-100">
                            <span className="font-bold">Lưu ý:</span> Một số thông tin nhập hàng đã bị khoá vì hoá đơn nhập đã được thanh toán.
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* CỘT 1: THÔNG TIN CƠ BẢN */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                <Smartphone className="h-5 w-5 text-blue-500" />
                                <h4 className="font-bold text-slate-800">
                                    Thông tin cơ bản
                                </h4>
                            </div>

                            <div className="space-y-4">
                                {/* MODEL NAME: Bị khoá nếu PAID */}
                                <FormField
                                    control={form.control}
                                    name="model_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={labelClass}>
                                                Tên máy / Model
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={isLocked}
                                                    className={`${inputClass} ${isLocked ? disabledClass : ''}`}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* IMEI: Bị khoá nếu PAID */}
                                <FormField
                                    control={form.control}
                                    name="imei"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={labelClass}>
                                                IMEI
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    maxLength={15}
                                                    disabled={isLocked} // <--- LOCK
                                                    className={`${inputClass} font-mono ${isLocked ? disabledClass : ''}`}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel
                                                    className={labelClass}
                                                >
                                                    Trạng thái
                                                </FormLabel>
                                                <Select
                                                    disabled={true}
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger
                                                            className={`${inputClass} cursor-not-allowed bg-slate-100 text-slate-500 opacity-100`}
                                                        >
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="IN_STOCK">
                                                            Trong kho
                                                        </SelectItem>
                                                        <SelectItem value="REPAIRING">
                                                            Đang sửa
                                                        </SelectItem>
                                                        <SelectItem value="SOLD">
                                                            Đã bán
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <p className="mt-1 text-[10px] text-slate-400">
                                                    *Trạng thái chỉ thay đổi khi
                                                    tạo hoá đơn bán hoặc phiếu
                                                    sửa chữa.
                                                </p>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="sale_price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel
                                                    className={labelClass}
                                                >
                                                    Giá bán (niêm yết)
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            {...field}
                                                            className={`${inputClass} pl-3 pr-8 font-bold`}
                                                        />
                                                        <span className="absolute right-3 top-2.5 text-sm text-slate-400">
                                                            ₫
                                                        </span>
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* CHI TIẾT MÁY */}
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="color"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel
                                                    className={labelClass}
                                                >
                                                    Màu sắc
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        className={inputClass}
                                                        placeholder="VD: Space Black"
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
                                                <FormLabel
                                                    className={labelClass}
                                                >
                                                    Dung lượng
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger
                                                            className={
                                                                inputClass
                                                            }
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
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="battery"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel
                                                    className={labelClass}
                                                >
                                                    Pin (%)
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            placeholder="99"
                                                            {...field}
                                                            className={`${inputClass} pr-8`}
                                                        />
                                                        <span className="absolute right-3 top-2.5 text-sm text-slate-400">
                                                            %
                                                        </span>
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="appearance"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel
                                                    className={labelClass}
                                                >
                                                    Tình trạng / Ngoại quan
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        className={inputClass}
                                                        placeholder="VD: 99%, Keng..."
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* CỘT 2: THÔNG TIN NHẬP HÀNG */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                {/* Dùng icon thay thế cho material symbols */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-green-600"
                                >
                                    <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <path d="M2 15h10" />
                                    <path d="m9 18 3-3-3-3" />
                                </svg>
                                <h4 className="font-bold text-slate-800">
                                    Thông tin nhập hàng
                                </h4>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="purchase_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel
                                                    className={labelClass}
                                                >
                                                    Ngày nhập
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="date"
                                                        {...field}
                                                        disabled={isLocked} // <--- LOCK
                                                        className={`block ${inputClass} ${isLocked ? disabledClass : ''}`}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="purchase_price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel
                                                    className={labelClass}
                                                >
                                                    Giá nhập
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            disabled={isLocked} // <--- LOCK
                                                            className={`${inputClass} pl-3 pr-8 font-bold ${isLocked ? disabledClass : ''}`}
                                                        />
                                                        <span className="absolute right-3 top-2.5 text-sm text-slate-400">
                                                            ₫
                                                        </span>
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="seller_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={labelClass}>
                                                Tên người bán
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Nguyễn Văn A"
                                                    disabled={isLocked} // <--- LOCK
                                                    className={`${inputClass} ${isLocked ? disabledClass : ''}`}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="seller_phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel
                                                    className={labelClass}
                                                >
                                                    SĐT Liên hệ
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="09xx..."
                                                        disabled={isLocked} // <--- LOCK
                                                        className={`${inputClass} ${isLocked ? disabledClass : ''}`}
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
                                                <FormLabel
                                                    className={labelClass}
                                                >
                                                    CCCD / CMND
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Số căn cước công dân"
                                                        disabled={isLocked} // <--- LOCK
                                                        className={`${inputClass} font-mono ${isLocked ? disabledClass : ''}`}
                                                    />
                                                </FormControl>
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
                                                    {...field}
                                                    placeholder="Chi tiết về tình trạng, phụ kiện đi kèm (nếu có)..."
                                                    className="w-full rounded-lg border-slate-300 text-sm leading-relaxed text-slate-800 shadow-sm focus:border-primary focus:ring-primary"
                                                    rows={4}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="h-auto rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900"
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex h-auto items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-semibold text-white shadow-lg shadow-primary/25 hover:bg-blue-600"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-5 w-5" />
                        )}
                        <span>Lưu thay đổi</span>
                    </Button>
                </div>
            </form>
        </Form>
    )
}
