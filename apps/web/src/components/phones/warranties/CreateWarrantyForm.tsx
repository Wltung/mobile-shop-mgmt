'use client'

import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Search, ShieldCheck, Info, AlertCircle, AlertTriangle, FileText } from 'lucide-react'

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
    const [isDeviceExpired, setIsDeviceExpired] = useState(false)
    const { toast } = useToast()

    const form = useForm<CreateWarrantyValues>({
        resolver: zodResolver(createWarrantySchema),
        defaultValues: defaultCreateWarrantyValues,
    })

    const watchType = form.watch('type')

    const handleSelectDevice = (item: any, isExpired: boolean, formattedDate: string) => {
        setIsDeviceExpired(isExpired)

        form.setValue('invoice_id', item.invoice_id || undefined)
        form.setValue('phone_id', item.phone_id || undefined)
        form.setValue('customer_phone', item.customer_phone || '')
        form.setValue('customer_id_number', item.customer_id_number || '')
        
        form.setValue('warranty_expiry', formattedDate)
        form.setValue('start_date', item.base_date ? new Date(item.base_date).toISOString() : undefined)
        form.setValue('end_date', item.warranty_expiry ? new Date(item.warranty_expiry).toISOString() : undefined)

        form.setValue('device_name', item.calculated_device_name || '')
        form.setValue('imei', item.calculated_imei || '') 
        form.setValue('part_name', item.part_name || '')
        
        if (watchType === 'SALE') {
            form.setValue('customer_name', item.customer_name || 'Khách mua máy (Theo HD)') 
        } else {
            form.setValue('customer_name', item.customer_name || 'Khách vãng lai')
        }

        if (isExpired) {
            toast({ title: 'Lưu ý', description: 'Máy đã hết hạn bảo hành.', variant: 'destructive' })
        }
    }

    const onSubmit: SubmitHandler<CreateWarrantyValues> = async (values) => {
        if (isDeviceExpired) {
            toast({ 
                variant: 'destructive', 
                title: 'Từ chối tiếp nhận', 
                description: 'Thiết bị đã hết hạn bảo hành. Vui lòng tạo phiếu Sửa chữa dịch vụ thay vì phiếu Bảo hành.' 
            })
            return 
        }

        setIsLoading(true)
        try {
            // GỬI PAYLOAD VỚI CÁC TRƯỜNG ĐỘC LẬP ĐỂ BE GÓI JSON
            const payload = {
                type: values.type,
                phone_id: values.phone_id,
                invoice_id: values.invoice_id,
                device_name: values.device_name,
                imei: values.imei,
                part_name: values.part_name,
                
                condition: values.condition,
                fault: values.fault,
                cost: Number(values.cost) || 0,
                special_note: values.special_note,
                warranty_condition: values.warranty_condition,

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
                <div className="max-h-[75vh] flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                        {/* --- CỘT TRÁI --- */}
                        <div className="flex flex-col h-full">
                            <div className="flex items-center gap-3 text-blue-600 font-bold text-base mb-6">
                                <div className="bg-blue-50 p-1.5 rounded-lg"><Search className="h-5 w-5" /></div>
                                <h3>Thông tin bảo hành</h3>
                            </div>

                            <div className="space-y-1.5 mb-6">
                                <label className={labelClass}>Tìm kiếm máy / IMEI</label>
                                <WarrantyItemSearchSelect type={watchType} onSelect={handleSelectDevice} />
                            </div>

                            <div className="flex-1 p-5 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col gap-4">
                                <div className="flex items-center gap-2 text-slate-500 font-bold text-[11px] uppercase tracking-wider mb-1">
                                    <Info className="h-4 w-4" /> THÔNG TIN MÁY & KHÁCH HÀNG
                                </div>
                                <FormField control={form.control} name="customer_name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[13px] text-slate-500 font-medium">Tên khách hàng</FormLabel>
                                        <FormControl><Input {...field} className="h-10 bg-white border-slate-200 shadow-sm" disabled placeholder="Tên khách hàng" /></FormControl>
                                    </FormItem>
                                )} />
                                {/* THÊM ROW CHỨA SĐT VÀ CCCD */}
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="customer_phone" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[13px] text-slate-500 font-medium">Số điện thoại</FormLabel>
                                            <FormControl><Input {...field} className="h-10 bg-white border-slate-200 shadow-sm" disabled placeholder="SĐT" /></FormControl>
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="customer_id_number" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[13px] text-slate-500 font-medium">CCCD / CMND</FormLabel>
                                            <FormControl><Input {...field} className="h-10 bg-white border-slate-200 shadow-sm" disabled placeholder="CCCD" /></FormControl>
                                        </FormItem>
                                    )} />
                                </div>

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

                                {/* BOX LINH KIỆN NẰM DƯỚI IMEI */}
                                {watchType === 'REPAIR' && (
                                    <FormField control={form.control} name="part_name" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[13px] text-slate-500 font-medium">Linh kiện / Dịch vụ bảo hành</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="h-10 bg-blue-50/50 border-blue-100 text-blue-700 font-semibold shadow-sm" disabled placeholder="---" />
                                            </FormControl>
                                        </FormItem>
                                    )} />
                                )}
                            </div>
                        </div>

                        {/* --- CỘT PHẢI --- */}
                        <div className="flex flex-col gap-8">
                            {/* BLOCK CHI TIẾT BẢO HÀNH */}
                            <div>
                                <div className="flex items-center gap-3 text-amber-600 font-bold text-base mb-6">
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
                                                form.setValue('customer_phone', '')
                                                form.setValue('customer_id_number', '')
                                                form.setValue('imei', '')
                                                form.setValue('warranty_expiry', '')
                                                setIsDeviceExpired(false)
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
                            </div>

                            {/* BLOCK THÔNG TIN LỖI */}
                            <div>
                                <div className="flex items-center gap-3 text-red-600 font-bold text-base mb-6">
                                    <div className="bg-red-50 p-1.5 rounded-lg"><AlertTriangle className="h-5 w-5" /></div>
                                    <h3>Thông tin tiếp nhận lỗi</h3>
                                </div>
                                <div className="space-y-4">
                                    <FormField control={form.control} name="condition" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={labelClass}>Tình trạng máy khi nhận</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} rows={2} placeholder="Mô tả tình trạng ngoại quan, trầy xước..." className="w-full rounded-lg border-slate-200 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none p-3 text-sm" />
                                            </FormControl>
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="fault" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={labelClass}>Lỗi khách thông báo <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Textarea {...field} rows={2} placeholder="Mô tả lỗi theo lời khách..." className="w-full rounded-lg border-slate-200 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none p-3 text-sm" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    {/* THÊM TRƯỜNG CHI PHÍ PHÁT SINH */}
                                    <FormField control={form.control} name="cost" render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <FormLabel className="text-sm font-semibold text-slate-800 m-0">
                                                    Chi phí phát sinh <span className="text-slate-400 font-normal">(nếu có)</span>
                                                </FormLabel>
                                            </div>
                                            <FormControl>
                                                {/* THÊM w-48 VÀO ĐÂY ĐỂ BÓP NGẮN Ô NHẬP LẠI */}
                                                <div className="relative w-48"> 
                                                    <Input 
                                                        type="number" 
                                                        {...field} 
                                                        placeholder="0" 
                                                        className={`${inputClass} pr-4 text-right font-bold text-blue-600`} 
                                                    />
                                                    <span className="absolute right-3 top-3.5 text-xs font-bold text-slate-400">₫</span>
                                                </div>
                                            </FormControl>
                                            <p className="text-[11px] text-slate-500 mt-1.5">Nhập phí dịch vụ hoặc linh kiện thay thế ngoài hạn mức bảo hành.</p>
                                        </FormItem>
                                    )} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- ROW 2: GHI CHÚ VÀ ĐIỀU KIỆN --- */}
                    <div className="pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-3 text-emerald-600 font-bold text-base mb-6">
                            <div className="bg-emerald-50 p-1.5 rounded-lg"><FileText className="h-5 w-5" /></div>
                            <h3>Ghi chú & Điều kiện</h3>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <FormField control={form.control} name="special_note" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelClass}>Ghi chú đặc biệt</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} rows={3} placeholder="Ghi chú nội bộ (nếu có)..." className="w-full rounded-lg border-slate-200 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none p-3 text-sm" />
                                    </FormControl>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="warranty_condition" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelClass}>Điều kiện bảo hành</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} rows={3} placeholder="Các điều kiện loại trừ, lưu ý..." className="w-full rounded-lg border-slate-200 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none p-3 text-sm" />
                                    </FormControl>
                                </FormItem>
                            )} />
                        </div>
                        
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