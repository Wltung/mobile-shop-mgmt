'use client'

import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Search, ShieldCheck, Info, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

import { createWarrantySchema, CreateWarrantyValues, defaultCreateWarrantyValues } from './schema'
import { warrantyService } from '@/services/warranty.service'
import { useToast } from '@/hooks/use-toast'
import WarrantyItemSearchSelect from './WarrantyItemSearchSelect'

interface Props {
    onSuccess: () => void
    onCancel: () => void
}

export default function CreateWarrantyForm({ onSuccess, onCancel }: Props) {
    const [isLoading, setIsLoading] = useState(false)
    const [isDeviceExpired, setIsDeviceExpired] = useState(false) // State lưu trạng thái hết hạn
    const { toast } = useToast()

    const form = useForm<CreateWarrantyValues>({
        resolver: zodResolver(createWarrantySchema),
        defaultValues: defaultCreateWarrantyValues,
    })

    const watchType = form.watch('type')

    const handleSelectDevice = (item: any, isExpired: boolean, formattedDate: string) => {
        setIsDeviceExpired(isExpired)

        // 1. GÁN CÁC TRƯỜNG DÙNG CHUNG (Luôn lấy nếu có)
        form.setValue('invoice_id', item.invoice_id || undefined)
        form.setValue('phone_id', item.phone_id || undefined)
        form.setValue('customer_phone', item.customer_phone || '')
        form.setValue('warranty_expiry', formattedDate)
        
        // Map ngày tháng (Format sang ISO để Golang parse được thành time.Time)
        form.setValue('start_date', item.base_date ? new Date(item.base_date).toISOString() : undefined)
        form.setValue('end_date', item.warranty_expiry ? new Date(item.warranty_expiry).toISOString() : undefined)

        // 2. GÁN CÁC TRƯỜNG HIỂN THỊ THEO LOẠI
        if (watchType === 'SALE') {
            form.setValue('device_name', item.device_name || item.model_name || '')
            form.setValue('imei', item.calculated_imei || item.imei || '')
            form.setValue('customer_name', item.customer_name || 'Khách mua máy (Theo HD)') 
        } else {
            form.setValue('device_name', item.calculated_device_name || item.device_name || '')
            form.setValue('imei', item.calculated_imei || item.imei || '') 
            form.setValue('customer_name', item.customer_name || 'Khách vãng lai')
        }

        if (isExpired) {
            toast({
                title: 'Lưu ý dịch vụ',
                description: 'Máy đã hết hạn bảo hành. Nếu nhận sửa sẽ tính phí dịch vụ.',
                variant: 'destructive',
            })
        }
    }

    const onSubmit: SubmitHandler<CreateWarrantyValues> = async (values) => {
        setIsLoading(true)
        try {
            const payload = {
                type: values.type,
                customer_name: values.customer_name,
                customer_phone: values.customer_phone,
                phone_id: values.phone_id,
                invoice_id: values.invoice_id,
                device_name: values.device_name,
                imei: values.imei,
                description: values.description,
                technical_note: values.technical_note,
                start_date: values.start_date,
                end_date: values.end_date,
            }

            await warrantyService.create(payload)

            toast({ title: 'Thành công', description: 'Đã tạo phiếu tiếp nhận bảo hành.' })
            onSuccess()
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Lỗi', description: error.response?.data?.error || 'Không thể tạo phiếu.' })
        } finally {
            setIsLoading(false)
        }
    }

    const labelClass = 'block text-sm font-semibold text-slate-800 mb-1.5'
    const inputClass = 'h-11 rounded-lg border-slate-200 bg-white shadow-sm font-medium text-slate-800 focus:border-blue-500 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500'

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full bg-white">
                <div className="max-h-[70vh] flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* --- CỘT TRÁI --- */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 text-blue-600 font-bold text-base mb-2">
                                <div className="bg-blue-50 p-1.5 rounded-lg"><Search className="h-5 w-5" /></div>
                                <h3>Thông tin bảo hành</h3>
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelClass}>Tìm kiếm máy / IMEI</label>
                                <WarrantyItemSearchSelect type={watchType} onSelect={handleSelectDevice} />
                            </div>

                            <div className="p-5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-4">
                                <div className="flex items-center gap-2 text-slate-500 font-bold text-[11px] uppercase tracking-wider mb-2">
                                    <Info className="h-4 w-4" /> THÔNG TIN MÁY & KHÁCH HÀNG
                                </div>
                                <FormField control={form.control} name="customer_name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[13px] text-slate-500 font-medium">Tên khách hàng</FormLabel>
                                        <FormControl><Input {...field} className="h-10 bg-white border-slate-200 shadow-sm" disabled placeholder="Tên khách hàng" /></FormControl>
                                    </FormItem>
                                )} />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="device_name" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[13px] text-slate-500 font-medium">Đời máy</FormLabel>
                                            <FormControl><Input {...field} className="h-10 bg-white border-slate-200 shadow-sm" disabled placeholder="Đời máy" /></FormControl>
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="imei" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[13px] text-slate-500 font-medium">IMEI</FormLabel>
                                            <FormControl><Input {...field} className="h-10 bg-white border-slate-200 shadow-sm font-mono" disabled placeholder="Số IMEI" /></FormControl>
                                        </FormItem>
                                    )} />
                                </div>
                            </div>
                        </div>

                        {/* --- CỘT PHẢI --- */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 text-amber-600 font-bold text-base mb-2">
                                <div className="bg-amber-50 p-1.5 rounded-lg"><ShieldCheck className="h-5 w-5" /></div>
                                <h3>Chi tiết bảo hành</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="type" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelClass}>Loại bảo hành</FormLabel>
                                        <Select onValueChange={(val) => {
                                            field.onChange(val)
                                            form.setValue('device_name', '')
                                            form.setValue('customer_name', '')
                                            form.setValue('imei', '')
                                            form.setValue('warranty_expiry', '')
                                            setIsDeviceExpired(false) // Reset trạng thái hết hạn
                                        }} defaultValue={field.value}>
                                            <FormControl><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="SALE">Bán máy</SelectItem>
                                                <SelectItem value="REPAIR">Sửa chữa</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="warranty_expiry" render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <FormLabel className="text-sm font-semibold text-slate-800 m-0">Hạn bảo hành</FormLabel>
                                            {/* HIỂN THỊ CẢNH BÁO TRỰC TIẾP TRÊN FORM */}
                                            {isDeviceExpired && (
                                                <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-red-600">
                                                    <AlertCircle className="h-3 w-3" /> Đã hết hạn
                                                </span>
                                            )}
                                        </div>
                                        <FormControl>
                                            <Input {...field} type="date" className={`${inputClass} ${isDeviceExpired ? 'border-red-300 text-red-600 font-semibold bg-red-50' : ''}`} disabled />
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </div>

                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelClass}>Mô tả tình trạng / Lỗi</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} rows={5} placeholder="Mô tả chi tiết tình trạng máy khi tiếp nhận..." className="w-full rounded-xl border-slate-200 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none p-4" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </div>

                    <div className="space-y-6 pt-4 border-t border-slate-100">
                        <FormField control={form.control} name="technical_note" render={({ field }) => (
                            <FormItem>
                                <FormLabel className={labelClass}>Ghi chú thêm</FormLabel>
                                <FormControl><Input {...field} placeholder="Ghi chú nội bộ (nếu có)..." className={inputClass} /></FormControl>
                            </FormItem>
                        )} />
                        
                        <FormField control={form.control} name="create_receipt" render={({ field }) => (
                            <FormItem className="flex items-center gap-3 m-0 space-y-0">
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-blue-600" /></FormControl>
                                <FormLabel className="text-[15px] font-semibold text-slate-800 m-0 cursor-pointer">In phiếu bảo hành ngay sau khi tạo</FormLabel>
                            </FormItem>
                        )} />
                    </div>
                </div>

                <div className="px-8 py-5 bg-white border-t border-slate-200 flex justify-end gap-3 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                    <Button type="button" variant="outline" onClick={onCancel} className="h-11 px-8 rounded-xl border-slate-300 font-bold text-slate-700 hover:bg-slate-50">Hủy</Button>
                    <Button type="submit" disabled={isLoading} className="h-11 px-8 rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Xác nhận tạo phiếu
                    </Button>
                </div>
            </form>
        </Form>
    )
}