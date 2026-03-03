'use client'

import { useState, useMemo, useEffect } from 'react'
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, User, Smartphone, Banknote, Wrench, AlertTriangle, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { editRepairSchema, EditRepairValues } from './schema'
import { repairService } from '@/services/repair.service'
import { useToast } from '@/hooks/use-toast'
import { Repair } from '@/types/repair'
import { formatCurrency } from '@/lib/utils'
import { buildRepairDescription, parseRepairDescription, parseViVNDateToInput } from '@/lib/repairParser'
import { Switch } from '@/components/ui/switch'

interface Props {
    repair: Repair
    onSuccess: () => void
    onCancel: () => void
}

export default function EditRepairForm({ repair, onSuccess, onCancel }: Props) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const parsedData = useMemo(() => {
        return parseRepairDescription(repair.description, repair.device_name, repair.part_cost)
    }, [repair])

    const form = useForm<EditRepairValues>({
        resolver: zodResolver(editRepairSchema),
        defaultValues: {
            customer_name: repair.customer_name || '',
            customer_phone: repair.customer_phone || '',
            device_name: parsedData.deviceName,
            imei: parsedData.imei,
            color: parsedData.color,
            description: parsedData.mainError,
            accessories: parsedData.accessories,
            device_password: repair.device_password || '',
            appointment_date: parseViVNDateToInput(parsedData.appointmentDate),
            status: repair.status as any || 'PENDING',
            repair_type: repair.repair_type as any || 'NORMAL',
            technical_note: parsedData.technicalNote,
            parts: parsedData.parts.map(p => ({ name: p.name, price: String(p.price), warranty: String(p.warranty) })),
            repair_price: repair.repair_price?.toString() || '0',
            discount: (parsedData as any).discount?.toString() || '0',
            has_labor_warranty: (parsedData as any).hasLaborWarranty || false,
        },
    })

    useEffect(() => {
        form.reset({
            customer_name: repair.customer_name || '',
            customer_phone: repair.customer_phone || '',
            device_name: parsedData.deviceName,
            imei: parsedData.imei,
            color: parsedData.color,
            description: parsedData.mainError,
            accessories: parsedData.accessories,
            device_password: repair.device_password || '',
            appointment_date: parseViVNDateToInput(parsedData.appointmentDate),
            status: repair.status as any || 'PENDING',
            repair_type: repair.repair_type as any || 'NORMAL',
            technical_note: parsedData.technicalNote,
            parts: parsedData.parts.map(p => ({ name: p.name, price: String(p.price), warranty: String(p.warranty) })),
            repair_price: repair.repair_price?.toString() || '0',
            discount: (parsedData as any).discount?.toString() || '0',
            has_labor_warranty: (parsedData as any).hasLaborWarranty || false,
        })
    }, [repair, parsedData, form])

    const { fields, append, remove } = useFieldArray({ control: form.control, name: "parts" })

    const watchParts = form.watch('parts') || []
    const watchLabor = form.watch('repair_price')
    const watchDiscount = form.watch('discount')
    const totalPartCost = watchParts.reduce((sum, p) => sum + (Number(p.price) || 0), 0)
    const totalCost = totalPartCost + (Number(watchLabor) || 0) - (Number(watchDiscount) || 0)

    const isLocked = repair.status === 'COMPLETED'

    const onSubmit: SubmitHandler<EditRepairValues> = async (values) => {
        setIsLoading(true)
        try {
            const finalDescription = buildRepairDescription({
                mainError: values.description,
                deviceName: values.device_name,
                isExternalDevice: !repair.phone_id, 
                imei: values.imei,
                color: values.color,
                accessories: values.accessories,
                appointmentDate: values.appointment_date,
                technicalNote: values.technical_note,
                parts: values.parts,
                discount: values.discount,
                hasLaborWarranty: values.has_labor_warranty,
            })

            const payload = {
                customer_name: values.customer_name,
                customer_phone: values.customer_phone,
                description: finalDescription,
                device_password: values.device_password || undefined,
                part_cost: totalPartCost, 
                repair_price: values.repair_price ? Number(values.repair_price) : 0,
                repair_type: values.repair_type,
                status: values.status,
            }

            // 1. Cập nhật thông tin phiếu trước
            await repairService.update(repair.id, payload)

            // 2. Nếu trạng thái là HOÀN THÀNH và phiếu chưa có Hoá đơn -> Gọi tạo hoá đơn
            if (values.status === 'COMPLETED' && !repair.invoice_id) {
                await repairService.complete(repair.id)
                toast({ title: 'Thành công', description: 'Đã lưu và tự động tạo hoá đơn sửa chữa!' })
            } else {
                toast({ title: 'Thành công', description: 'Đã cập nhật phiếu sửa chữa.' })
            }

            onSuccess()
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Lỗi', description: error.response?.data?.error || 'Không thể cập nhật phiếu.' })
        } finally {
            setIsLoading(false)
        }
    }

    const inputClass = "h-11 rounded-lg border-slate-300 bg-white text-slate-800 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm disabled:bg-slate-50 disabled:text-slate-500"
    const labelClass = "block text-sm font-bold text-slate-700 mb-1"
    const cardClass = "p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-5"
    const cardHeaderClass = "flex items-center gap-2 mb-4 text-blue-600 font-bold uppercase text-sm tracking-wider border-b border-slate-100 pb-3"

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
                <div className="max-h-[70vh] flex-1 overflow-y-auto p-6 space-y-6">
                    {isLocked && (
                        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 flex items-center gap-3 text-blue-800">
                            <AlertTriangle className="h-5 w-5" />
                            <span className="text-sm">Phiếu này đã <b>hoàn thành và xuất hoá đơn</b>. Việc chỉnh sửa chi phí ở đây sẽ không làm thay đổi hoá đơn đã xuất.</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* --- CỘT TRÁI --- */}
                        <div className="space-y-6 flex flex-col">
                            {/* BLOCK 1: THIẾT BỊ */}
                            <div className={cardClass}>
                                <div className={cardHeaderClass}>
                                    <Smartphone className="h-5 w-5" />
                                    <h3>THÔNG TIN THIẾT BỊ</h3>
                                </div>
                                <FormField control={form.control} name="device_name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelClass}>Đời máy</FormLabel>
                                        <FormControl><Input {...field} className={inputClass} /></FormControl>
                                    </FormItem>
                                )} />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="imei" render={({ field }) => (
                                        <FormItem><FormLabel className={labelClass}>IMEI/Serial</FormLabel><FormControl><Input {...field} className={inputClass} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name="color" render={({ field }) => (
                                        <FormItem><FormLabel className={labelClass}>Màu sắc</FormLabel><FormControl><Input {...field} className={inputClass} /></FormControl></FormItem>
                                    )} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="device_password" render={({ field }) => (
                                        <FormItem><FormLabel className={labelClass}>Mật khẩu</FormLabel><FormControl><Input {...field} className={`${inputClass} text-red-500 font-mono font-bold bg-red-50/30 border-red-200`} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name="accessories" render={({ field }) => (
                                        <FormItem><FormLabel className={labelClass}>Linh kiện kèm</FormLabel><FormControl><Input {...field} className={inputClass} /></FormControl></FormItem>
                                    )} />
                                </div>
                            </div>

                            {/* BLOCK 2: CHI TIẾT SỬA CHỮA */}
                            <div className={`${cardClass} flex-1`}>
                                <div className={cardHeaderClass}><Wrench className="h-5 w-5" /><h3>CHI TIẾT SỬA CHỮA</h3></div>
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem><FormLabel className={labelClass}>Mô tả lỗi <span className="text-red-500">*</span></FormLabel><FormControl><Textarea {...field} rows={3} className="w-full rounded-lg bg-white border-slate-300 text-sm leading-relaxed text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></FormControl><FormMessage /></FormItem>
                                )} />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="status" render={({ field }) => (
                                        <FormItem><FormLabel className={labelClass}>Trạng thái</FormLabel>
                                            {/* Disabled select nếu phiếu đã chốt, tránh nhân viên lùi trạng thái */}
                                            <Select onValueChange={field.onChange} value={field.value} disabled={isLocked}>
                                                <FormControl><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="PENDING">Chờ kiểm tra</SelectItem>
                                                    <SelectItem value="REPAIRING">Đang sửa</SelectItem>
                                                    <SelectItem value="WAITING_CUSTOMER">Chờ khách</SelectItem>
                                                    <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="appointment_date" render={({ field }) => (
                                        <FormItem><FormLabel className={labelClass}>Hẹn trả máy</FormLabel><FormControl><Input type="datetime-local" {...field} className={`${inputClass} block`} /></FormControl></FormItem>
                                    )} />
                                </div>
                                <FormField control={form.control} name="technical_note" render={({ field }) => (
                                    <FormItem><FormLabel className={labelClass}>Ghi chú kỹ thuật</FormLabel><FormControl><Textarea {...field} rows={2} className="w-full rounded-lg bg-slate-50 border-slate-200 text-sm leading-relaxed text-slate-900 shadow-inner focus:border-blue-500 focus:bg-white" /></FormControl></FormItem>
                                )} />
                            </div>
                        </div>

                        {/* --- CỘT PHẢI --- */}
                        <div className="space-y-6 flex flex-col">
                            {/* BLOCK 3: KHÁCH HÀNG */}
                            <div className={cardClass}>
                                <div className={cardHeaderClass}><User className="h-5 w-5" /><h3>THÔNG TIN KHÁCH HÀNG</h3></div>
                                <FormField control={form.control} name="customer_name" render={({ field }) => (
                                    <FormItem><FormLabel className={labelClass}>Họ và tên <span className="text-red-500">*</span></FormLabel><FormControl><Input {...field} className={inputClass} /></FormControl></FormItem>
                                )} />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="customer_phone" render={({ field }) => (
                                        <FormItem><FormLabel className={labelClass}>Số điện thoại <span className="text-red-500">*</span></FormLabel><FormControl><Input {...field} className={inputClass} /></FormControl></FormItem>
                                    )} />
                                    <div className="space-y-2"><label className={labelClass}>Địa chỉ</label><Input value="---" className={inputClass} disabled /></div>
                                </div>
                            </div>

                            {/* BLOCK 4: CHI PHÍ & LINH KIỆN */}
                            <div className={`p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex-1 flex flex-col`}>
                                <div className={cardHeaderClass}><Banknote className="h-5 w-5" /><h3>CHI PHÍ & LINH KIỆN</h3></div>
                                <div className="space-y-3">
                                    <div className="flex gap-3 text-[11px] font-bold text-slate-400 uppercase px-1">
                                        <div className="flex-1">Tên linh kiện</div><div className="w-32 text-right">Đơn giá</div><div className="w-20 text-center">BH (Tháng)</div><div className="w-8"></div>
                                    </div>
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex gap-3 items-start">
                                            <FormField control={form.control} name={`parts.${index}.name`} render={({field}) => (<FormItem className="flex-1"><FormControl><Input {...field} className={inputClass} /></FormControl></FormItem>)} />
                                            <FormField control={form.control} name={`parts.${index}.price`} render={({field}) => (<FormItem className="w-32"><FormControl><Input {...field} type="number" className={`${inputClass} text-right`} /></FormControl></FormItem>)} />
                                            <FormField control={form.control} name={`parts.${index}.warranty`} render={({field}) => (<FormItem className="w-20"><FormControl><Input {...field} type="number" className={`${inputClass} text-center`} /></FormControl></FormItem>)} />
                                            <Button type="button" variant="ghost" className="w-8 h-11 px-0 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 h-8 text-sm font-semibold -ml-3" onClick={() => append({name: '', price: '', warranty: '12'})}>+ Thêm dòng</Button>
                                </div>
                                <div className="mt-auto pt-4">
                                    <hr className="border-dashed border-slate-200 my-6" />
                                    <div className="space-y-4">
                                        {/* 1. TIỀN CÔNG THỢ + SWITCH BẢO HÀNH */}
                                        <FormField control={form.control} name="repair_price" render={({ field }) => (
                                            <FormItem className="flex items-center justify-between space-y-0">
                                                <div className="flex items-center gap-4">
                                                    <FormLabel className="text-sm font-semibold text-slate-700">Tiền công thợ</FormLabel>
                                                    <FormField control={form.control} name="has_labor_warranty" render={({ field: wField }) => (
                                                        <FormItem className="flex items-center gap-2 space-y-0">
                                                            <FormControl>
                                                                <Switch 
                                                                    checked={wField.value} 
                                                                    onCheckedChange={wField.onChange} 
                                                                    className="data-[state=checked]:bg-blue-600 scale-75 origin-left m-0" 
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="text-[13px] text-slate-500 font-normal m-0 cursor-pointer">
                                                                Bảo hành 7 ngày
                                                            </FormLabel>
                                                        </FormItem>
                                                    )} />
                                                </div>
                                                <FormControl>
                                                    <div className="relative w-40">
                                                        <Input type="number" {...field} className={`${inputClass} text-right pr-6 font-bold`} />
                                                        <span className="absolute right-3 top-3 text-sm font-bold text-slate-400">₫</span>
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )} />
                                        {/* 2. GIẢM GIÁ */}
                                        <FormField control={form.control} name="discount" render={({ field }) => (
                                            <FormItem className="flex items-center justify-between space-y-0">
                                                <FormLabel className="text-sm font-semibold text-slate-700">Giảm giá</FormLabel>
                                                <FormControl>
                                                    <div className="relative w-40">
                                                        <Input 
                                                            type="number" 
                                                            {...field} 
                                                            className={`${inputClass} text-right pr-6 font-bold text-emerald-600 border-emerald-200 focus:border-emerald-500 bg-emerald-50/30`} 
                                                        />
                                                        <span className="absolute right-3 top-3 text-sm font-bold text-emerald-500">₫</span>
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )} />

                                        {/* 3. TỔNG CỘNG */}
                                        <div className="flex justify-between items-end pt-4 mt-2 border-t border-slate-100">
                                            <span className="text-[15px] font-bold text-slate-800">Tổng cộng</span>
                                            <span className="text-2xl font-black text-blue-600">{formatCurrency(totalCost)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FOOTER --- */}
                <div className="px-8 py-4 bg-white border-t border-slate-200 flex justify-end gap-3 shrink-0">
                    <Button type="button" variant="outline" onClick={onCancel} className="h-11 px-6 rounded-xl border-slate-300 text-slate-700 font-bold hover:bg-slate-50">Hủy bỏ</Button>
                    <Button type="submit" disabled={isLoading} className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20">
                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />} Lưu thay đổi
                    </Button>
                </div>
            </form>
        </Form>
    )
}