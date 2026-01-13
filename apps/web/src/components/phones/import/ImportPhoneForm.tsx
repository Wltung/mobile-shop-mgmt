'use client'

import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ChevronDown, ChevronRight } from 'lucide-react'

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

import { importSchema, ImportFormValues, defaultImportValues } from './schema'
import { phoneService } from '@/services/phone.service'
import { useToast } from '@/hooks/use-toast'

interface Props {
    onSuccess: () => void
    onCancel: () => void
}

export default function ImportPhoneForm({ onSuccess, onCancel }: Props) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const form = useForm<ImportFormValues>({
        resolver: zodResolver(importSchema),
        defaultValues: defaultImportValues,
    })

    const onSubmit: SubmitHandler<ImportFormValues> = async (values) => {
        setIsLoading(true)
        try {
            const payload = {
                imei: values.imei,
                model_name: values.model_name,
                purchase_price: values.purchase_price,
                status: values.status,
                note: values.note || '',
                seller_name: values.seller_name,
                seller_phone: values.seller_phone,
                seller_id: values.seller_id,
                details: {
                    color: values.color,
                    storage: values.storage,
                    battery: values.battery,
                    appearance: values.appearance,
                    import_date: values.import_date,
                },
            }

            await phoneService.create(payload)

            toast({
                variant: 'success',
                title: 'Thành công',
                description: 'Đã nhập máy vào kho',
            })
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

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
                    <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                        {/* --- SỬA ĐỔI TẠI ĐÂY: Dùng Input thay vì Select --- */}
                        <FormField
                            control={form.control}
                            name="model_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-slate-700">
                                        Đời máy{' '}
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ví dụ: iPhone 15 Pro Max"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Cột 2: IMEI */}
                        <FormField
                            control={form.control}
                            name="imei"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-slate-700">
                                        IMEI{' '}
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Nhập 15 số IMEI"
                                            maxLength={15}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Các trường còn lại giữ nguyên Select/Input như cũ */}
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-slate-700">
                                        Trạng thái
                                    </FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="purchase_price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-slate-700">
                                        Giá nhập{' '}
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                placeholder="0"
                                                {...field}
                                                onChange={(event) =>
                                                    field.onChange(
                                                        Number(
                                                            event.target.value,
                                                        ),
                                                    )
                                                }
                                            />
                                            <span className="absolute right-3 top-2.5 text-sm font-medium text-slate-500">
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
                            name="import_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-slate-700">
                                        Ngày nhập
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                            className="block w-full"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="seller_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-slate-700">
                                        Họ tên người bán
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Nguyễn Văn A"
                                            {...field}
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
                                    <FormLabel className="font-semibold text-slate-700">
                                        Số điện thoại
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="tel" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="seller_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-slate-700">
                                        Số CCCD
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="text" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* ACCORDION CHI TIẾT */}
                    <div className="mt-8 border-t border-slate-100 pt-6">
                        <button
                            type="button"
                            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                            className="group flex items-center text-sm font-bold text-primary transition-colors hover:text-blue-700 focus:outline-none"
                        >
                            {isDetailsOpen ? (
                                <ChevronDown className="mr-2 h-5 w-5" />
                            ) : (
                                <ChevronRight className="mr-2 h-5 w-5" />
                            )}
                            Chi tiết máy (Màu sắc, Dung lượng, Pin...)
                        </button>

                        {isDetailsOpen && (
                            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5 animate-in slide-in-from-top-2">
                                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="color"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium text-slate-700">
                                                    Màu sắc
                                                </FormLabel>
                                                {/* Ở đây vẫn dùng Select vì màu sắc nên chuẩn hóa */}
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white">
                                                            <SelectValue placeholder="Chọn màu" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Đen">
                                                            Đen
                                                        </SelectItem>
                                                        <SelectItem value="Trắng">
                                                            Trắng
                                                        </SelectItem>
                                                        <SelectItem value="Vàng">
                                                            Vàng
                                                        </SelectItem>
                                                        <SelectItem value="Titan">
                                                            Titan
                                                        </SelectItem>
                                                        <SelectItem value="Xanh">
                                                            Xanh
                                                        </SelectItem>
                                                        <SelectItem value="Đỏ">
                                                            Đỏ
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="storage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium text-slate-700">
                                                    Dung lượng
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white">
                                                            <SelectValue placeholder="Chọn GB" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="64GB">
                                                            64 GB
                                                        </SelectItem>
                                                        <SelectItem value="128GB">
                                                            128 GB
                                                        </SelectItem>
                                                        <SelectItem value="256GB">
                                                            256 GB
                                                        </SelectItem>
                                                        <SelectItem value="512GB">
                                                            512 GB
                                                        </SelectItem>
                                                        <SelectItem value="1TB">
                                                            1 TB
                                                        </SelectItem>
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
                                                <FormLabel className="font-medium text-slate-700">
                                                    Tình trạng Pin (%)
                                                </FormLabel>
                                                <FormControl>
                                                    {/* Dùng value={... ?? ''} để tránh lỗi uncontrolled */}
                                                    <Input
                                                        type="number"
                                                        placeholder="100"
                                                        {...field}
                                                        value={
                                                            field.value ?? ''
                                                        }
                                                        className="bg-white"
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
                                                <FormLabel className="font-medium text-slate-700">
                                                    Ngoại quan
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white">
                                                            <SelectValue placeholder="Tình trạng" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Like New">
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
                        )}
                    </div>

                    <div className="mt-6">
                        <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-slate-700">
                                        Ghi chú
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Nhập ghi chú thêm về máy..."
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex flex-row-reverse gap-3 rounded-b-2xl border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-sidebar hover:bg-sidebar-hover"
                    >
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Xác nhận nhập kho
                    </Button>
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Hủy
                    </Button>
                </div>
            </form>
        </Form>
    )
}
