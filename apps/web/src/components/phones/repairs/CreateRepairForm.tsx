'use client'

import { useState, useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, User, Smartphone, ClipboardList, Banknote, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'

import {
    createRepairSchema,
    CreateRepairValues,
    defaultCreateRepairValues,
} from './schema'
import { repairService } from '@/services/repair.service'
import { useToast } from '@/hooks/use-toast'

interface Props {
    onSuccess: () => void
    onCancel: () => void
}

export default function CreateRepairForm({ onSuccess, onCancel }: Props) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const form = useForm<CreateRepairValues>({
        resolver: zodResolver(createRepairSchema),
        defaultValues: defaultCreateRepairValues,
    })

    const isWarranty = form.watch('is_warranty')

    useEffect(() => {
        if (isWarranty) {
            form.setValue('repair_price', '0')
        }
    }, [isWarranty, form])

    const onSubmit: SubmitHandler<CreateRepairValues> = async (values) => {
        setIsLoading(true)
        try {
            let finalDescription = values.description
            if (values.imei) finalDescription += `\n- IMEI: ${values.imei}`
            if (values.color) finalDescription += `\n- Màu: ${values.color}`
            if (values.accessories) finalDescription += `\n- Kèm theo: ${values.accessories}`
            if (values.appointment_date) {
                const date = new Date(values.appointment_date).toLocaleString('vi-VN')
                finalDescription += `\n- Hẹn trả: ${date}`
            }

            const payload = {
                customer_name: values.customer_name,
                customer_phone: values.customer_phone,
                device_name: values.device_name,
                device_password: values.device_password || undefined,
                repair_type: values.is_warranty ? 'WARRANTY' : 'NORMAL',
                description: finalDescription,
                part_cost: values.part_cost ? Number(values.part_cost) : undefined,
                repair_price: values.repair_price ? Number(values.repair_price) : undefined,
            }

            await repairService.create(payload)

            toast({
                title: 'Thành công',
                description: 'Đã tạo phiếu tiếp nhận máy sửa.',
            })

            // TODO: In phiếu hẹn nếu values.create_receipt == true

            onSuccess()
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error.response?.data?.error || 'Không thể tạo phiếu tiếp nhận.',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const inputClass =
        'h-11 rounded-lg border-slate-300 bg-white text-slate-800 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500'
    const labelClass = 'block text-sm font-bold text-slate-700 mb-1'
    const cardClass = 'p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4 h-full' // Thêm h-full để 2 cột cao bằng nhau nếu cần

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex h-full flex-col bg-[#f8fafc]"
            >
                <div className="max-h-[70vh] flex-1 space-y-6 overflow-y-auto px-6 py-6 pb-10">
                    
                    {/* --- HÀNG 1: KHÁCH HÀNG & THIẾT BỊ --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* BLOCK 1: KHÁCH HÀNG */}
                        <div className={cardClass}>
                            <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold uppercase text-sm tracking-wider border-b border-slate-100 pb-3">
                                <User className="h-5 w-5 text-blue-600" />
                                <h3>THÔNG TIN KHÁCH HÀNG</h3>
                            </div>
                            
                            <FormField control={form.control} name="customer_name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelClass}>
                                        Họ tên khách hàng <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nguyễn Văn A" {...field} className={inputClass} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="customer_phone" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelClass}>
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="tel" placeholder="09xxxxxxxx" {...field} className={inputClass} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        {/* BLOCK 2: THIẾT BỊ */}
                        <div className={cardClass}>
                            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2 text-blue-600 font-bold uppercase text-sm tracking-wider">
                                    <Smartphone className="h-5 w-5 text-blue-600" />
                                    <h3>THÔNG TIN THIẾT BỊ</h3>
                                </div>
                                <FormField control={form.control} name="is_warranty" render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0">
                                        <FormControl>
                                            <Switch 
                                                checked={field.value} 
                                                onCheckedChange={field.onChange} 
                                                className="data-[state=checked]:bg-blue-600"
                                            />
                                        </FormControl>
                                        <FormLabel className="text-sm font-semibold text-slate-700 m-0 cursor-pointer">
                                            Máy bảo hành
                                        </FormLabel>
                                    </FormItem>
                                )} />
                            </div>

                            <FormField control={form.control} name="device_name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelClass}>
                                        Đời máy <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl><Input placeholder="Ví dụ: iPhone 14 Pro" {...field} className={inputClass} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormField control={form.control} name="imei" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelClass}>IMEI</FormLabel>
                                        <FormControl><Input placeholder="Nhập IMEI (nếu có)" maxLength={15} {...field} className={`${inputClass} font-mono`} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="color" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelClass}>Màu sắc</FormLabel>
                                        <FormControl><Input placeholder="Vàng, Đen..." {...field} className={inputClass} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </div>

                    </div>

                    {/* --- HÀNG 2: TÌNH TRẠNG & CHI PHÍ --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* BLOCK 3: TÌNH TRẠNG TIẾP NHẬN */}
                        <div className={cardClass}>
                            <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold uppercase text-sm tracking-wider border-b border-slate-100 pb-3">
                                <ClipboardList className="h-5 w-5 text-blue-600" />
                                <h3>TÌNH TRẠNG TIẾP NHẬN</h3>
                            </div>

                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelClass}>
                                        Mô tả lỗi <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Mô tả chi tiết tình trạng máy khi nhận, lỗi khách báo..."
                                            rows={4}
                                            {...field}
                                            className="w-full rounded-lg bg-white border-slate-300 text-sm leading-relaxed text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder:text-slate-400"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="accessories" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelClass}>Linh kiện kèm theo</FormLabel>
                                    <FormControl><Input placeholder="Sim, Thẻ nhớ, Ốp lưng..." {...field} className={inputClass} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="device_password" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelClass}>Mật khẩu máy</FormLabel>
                                    <FormControl><Input placeholder="Mật khẩu màn hình (nếu có)" {...field} className={inputClass} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        {/* BLOCK 4: CHI PHÍ & HẸN */}
                        <div className={cardClass}>
                            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2 text-blue-600 font-bold uppercase text-sm tracking-wider">
                                    <Banknote className="h-5 w-5 text-blue-600" />
                                    <h3>DỊCH VỤ & CHI PHÍ</h3>
                                </div>
                                {isWarranty && (
                                    <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-100 shadow-sm">
                                        <ShieldCheck className="w-4 h-4" />
                                        <span>Bảo hành</span>
                                    </div>
                                )}
                            </div>

                            <FormField control={form.control} name="part_cost" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelClass}>Tiền linh kiện (Dự kiến)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type="number" placeholder="0" {...field} className={`${inputClass} pl-3 pr-14`} />
                                            <span className="absolute right-4 top-3 text-sm font-semibold text-slate-400">VNĐ</span>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="repair_price" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelClass}>
                                        Tiền công 
                                        {isWarranty && <span className="text-slate-400 font-normal ml-1 text-[13px]">(Miễn phí bảo hành)</span>}
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input 
                                                type="number" 
                                                placeholder="0" 
                                                {...field} 
                                                disabled={isWarranty} // Khóa nhập tiền công nếu là bảo hành
                                                className={`${inputClass} pl-3 pr-14`} 
                                            />
                                            <span className="absolute right-4 top-3 text-sm font-semibold text-slate-400">VNĐ</span>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="appointment_date" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelClass}>Hẹn trả máy</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} className={`${inputClass} block text-slate-600`} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-5">
                                <div className="space-y-0.5">
                                    <label className="text-base font-bold text-slate-800">In phiếu hẹn</label>
                                    <p className="text-sm text-slate-500">In phiếu tiếp nhận ngay sau khi lưu</p>
                                </div>
                                <FormField control={form.control} name="create_receipt" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <label className="group relative inline-flex cursor-pointer select-none items-center">
                                                <input type="checkbox" className="peer sr-only" checked={field.value} onChange={field.onChange} />
                                                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-600/20"></div>
                                            </label>
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- FOOTER STICKY --- */}
                <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <Button type="button" variant="outline" onClick={onCancel} className="h-11 rounded-xl border-slate-300 font-semibold px-6 hover:bg-slate-50">
                        Hủy bỏ
                    </Button>
                    <Button type="submit" disabled={isLoading} className="h-11 rounded-xl bg-blue-600 font-semibold px-7 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Xác nhận tiếp nhận
                    </Button>
                </div>
            </form>
        </Form>
    )
}