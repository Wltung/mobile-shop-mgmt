'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, User, Smartphone, ClipboardList, Banknote, ShieldCheck, CheckCircle2, Info, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { createRepairSchema, CreateRepairValues, defaultCreateRepairValues } from './schema'
import { repairService } from '@/services/repair.service'
import { useToast } from '@/hooks/use-toast'
import { Phone } from '@/types/phone'
import PhoneSearchSelect from '../PhoneSearchSelect'
import { formatCurrency } from '@/lib/utils'

interface Props { onSuccess: () => void; onCancel: () => void }

const REPAIR_CATEGORIES = [
    { id: 'CUSTOMER_DEVICE_REPAIR', label: 'Máy khách', desc: 'Khách lẻ đem tới' },
    { id: 'SHOP_DEVICE_REPAIR', label: 'Máy cửa hàng', desc: 'Trong kho' },
]

export default function CreateRepairForm({ onSuccess, onCancel }: Props) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const form = useForm<CreateRepairValues>({
        resolver: zodResolver(createRepairSchema),
        defaultValues: defaultCreateRepairValues,
    })

    const { fields, append, remove } = useFieldArray({ control: form.control, name: "parts" })
    const repairCategory = form.watch('repair_category')
    const watchParts = form.watch('parts') || []
    const watchLabor = form.watch('repair_price')
    const watchDiscount = form.watch('discount')
    
    const totalPartCost = watchParts.reduce((sum, p) => sum + (Number(p.price) || 0), 0)
    const totalCost = totalPartCost + (Number(watchLabor) || 0) - (Number(watchDiscount) || 0)

    useEffect(() => {
        if (repairCategory === 'CUSTOMER_DEVICE_REPAIR') {
            form.setValue('phone_id', undefined)
            form.setValue('device_name', '')
            form.setValue('imei', '')
            form.setValue('color', '')
            form.setValue('customer_name', '')
            form.setValue('customer_phone', '')
        } else if (repairCategory === 'SHOP_DEVICE_REPAIR') {
            form.setValue('customer_name', 'Nội bộ cửa hàng')
            form.setValue('customer_phone', '0999999999')
        }
    }, [repairCategory, form])

    const handleSelectPhone = (phone: Phone) => {
        form.setValue('phone_id', phone.id)
        form.setValue('device_name', phone.model_name || '')
        form.setValue('imei', phone.imei || '')
        form.setValue('color', phone.details?.color || '')
    }

    const onSubmit: SubmitHandler<CreateRepairValues> = async (values) => {
        setIsLoading(true)
        try {
            const payload = {
                customer_name: values.customer_name || undefined,
                customer_phone: values.customer_phone || undefined,
                phone_id: values.phone_id,
                device_name: values.device_name,
                imei: values.imei,
                color: values.color,
                device_password: values.device_password || undefined,
                repair_category: values.repair_category,
                fault: values.fault, 
                accessories: values.accessories,
                promised_return_date: values.appointment_date ? new Date(values.appointment_date).toISOString() : undefined,
                
                // DATA TÍNH TIỀN MỚI
                part_cost: totalPartCost,
                repair_price: values.repair_price ? Number(values.repair_price) : 0,
                parts: values.parts.map(p => ({
                    name: p.name,
                    price: Number(p.price),
                    warranty: Number(p.warranty)
                })),
                discount: Number(values.discount) || 0,
                has_labor_warranty: values.has_labor_warranty
            }

            await repairService.create(payload)
            toast({ title: 'Thành công', description: 'Đã tạo phiếu tiếp nhận máy sửa.' })
            onSuccess()
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Lỗi', description: error.response?.data?.error || 'Không thể tạo phiếu tiếp nhận.' })
        } finally {
            setIsLoading(false)
        }
    }

    const inputClass = 'h-11 rounded-lg border-slate-300 bg-white text-slate-800 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm disabled:bg-slate-50 disabled:text-slate-500'
    const labelClass = 'block text-sm font-bold text-slate-700 mb-1'
    const cardClass = 'p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4 h-full'

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col bg-[#f8fafc]">
                <div className="max-h-[70vh] flex-1 space-y-6 overflow-y-auto px-6 py-6 pb-10">
                    
                    {/* --- BANNER THÔNG BÁO TỔNG THỂ CHO MÁY SHOP --- */}
                    {repairCategory === 'SHOP_DEVICE_REPAIR' && (
                        <div className="flex gap-3 rounded-xl border border-amber-200 bg-[#fffbeb] p-4 shadow-sm">
                            <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-500 fill-amber-100" />
                            <p className="text-[14px] leading-relaxed text-amber-800">
                                <span className="font-bold text-amber-900">Lưu ý sửa máy nội bộ: </span>
                                Sửa chữa máy kho sẽ không xuất hoá đơn thu tiền. Sau khi hoàn thành, máy sẽ tự động được mở khoá trạng thái về lại "Sẵn sàng bán".
                            </p>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className={cardClass}>
                            <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold uppercase text-sm tracking-wider border-b border-slate-100 pb-3">
                                <User className="h-5 w-5 text-blue-600" /><h3>THÔNG TIN & PHÂN LOẠI</h3>
                            </div>
                            <FormField control={form.control} name="repair_category" render={({ field }) => (
                                <FormItem className="mb-6">
                                    <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Phân loại máy</FormLabel>
                                    <div className="grid grid-cols-2 gap-3">
                                        {REPAIR_CATEGORIES.map(cat => (
                                            <div key={cat.id} onClick={() => field.onChange(cat.id)} className={`cursor-pointer rounded-xl border-2 p-3 transition-all ${field.value === cat.id ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className={`font-bold text-[13px] ${field.value === cat.id ? 'text-blue-700' : 'text-slate-700'}`}>{cat.label}</span>
                                                    {field.value === cat.id && <CheckCircle2 className="h-4 w-4 text-blue-500 fill-white" />}
                                                </div>
                                                <span className="text-[11px] text-slate-500 font-medium">{cat.desc}</span>
                                            </div>
                                        ))}
                                    </div>
                                </FormItem>
                            )} />

                            {repairCategory === 'CUSTOMER_DEVICE_REPAIR' && (
                                <>
                                    <FormField control={form.control} name="customer_name" render={({ field }) => (
                                        <FormItem><FormLabel className={labelClass}>Họ tên khách hàng</FormLabel><FormControl><Input placeholder="Khách vãng lai" {...field} className={inputClass} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="customer_phone" render={({ field }) => (
                                        <FormItem><FormLabel className={labelClass}>Số điện thoại</FormLabel><FormControl><Input type="tel" placeholder="09xxxxxxxx" {...field} className={inputClass} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </> 
                            )}
                        </div>

                        <div className={cardClass}>
                            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2 text-blue-600 font-bold uppercase text-sm tracking-wider">
                                    <Smartphone className="h-5 w-5 text-blue-600" /><h3>THÔNG TIN THIẾT BỊ</h3>
                                </div>
                            </div>

                            {repairCategory === 'SHOP_DEVICE_REPAIR' && (
                                <FormField control={form.control} name="phone_id" render={({ field, fieldState }) => (
                                    <FormItem className="mb-4">
                                        <FormControl><PhoneSearchSelect label="Tìm kiếm máy trong kho" onSelect={handleSelectPhone} error={fieldState.error?.message} hasSalePrice={false} /></FormControl>
                                    </FormItem>
                                )} />
                            )}

                            {repairCategory === 'CUSTOMER_DEVICE_REPAIR' && (
                                <>
                                    <FormField control={form.control} name="device_name" render={({ field }) => (
                                        <FormItem><FormLabel className={labelClass}>Đời máy <span className="text-red-500">*</span></FormLabel><FormControl><Input placeholder="Ví dụ: iPhone 14 Pro" {...field} className={inputClass} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="imei" render={({ field }) => (
                                        <FormItem><FormLabel className={labelClass}>IMEI</FormLabel><FormControl><Input placeholder="Nhập IMEI (nếu có)" maxLength={15} {...field} className={`${inputClass} font-mono`} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </>
                            )}
                            <FormField control={form.control} name="color" render={({ field }) => (
                                <FormItem><FormLabel className={labelClass}>Màu sắc</FormLabel><FormControl><Input placeholder="Vàng, Đen..." {...field} className={inputClass} disabled={repairCategory === 'SHOP_DEVICE_REPAIR'} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className={cardClass}>
                            <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold uppercase text-sm tracking-wider border-b border-slate-100 pb-3">
                                <ClipboardList className="h-5 w-5 text-blue-600" /><h3>TÌNH TRẠNG TIẾP NHẬN</h3>
                            </div>
                            <FormField control={form.control} name="fault" render={({ field }) => (
                                <FormItem><FormLabel className={labelClass}>Mô tả lỗi <span className="text-red-500">*</span></FormLabel><FormControl><Textarea placeholder="Mô tả chi tiết tình trạng máy khi nhận..." rows={4} {...field} className="w-full rounded-lg bg-white border-slate-300 text-sm leading-relaxed text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder:text-slate-400" /></FormControl><FormMessage /></FormItem>
                            )} />
                            {repairCategory === 'CUSTOMER_DEVICE_REPAIR' && (
                                <>
                                    <FormField control={form.control} name="accessories" render={({ field }) => (
                                        <FormItem><FormLabel className={labelClass}>Linh kiện kèm theo</FormLabel><FormControl><Input placeholder="Sim, Thẻ nhớ, Ốp lưng..." {...field} className={inputClass} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="device_password" render={({ field }) => (
                                        <FormItem><FormLabel className={labelClass}>Mật khẩu máy</FormLabel><FormControl><Input placeholder="Mật khẩu màn hình (nếu có)" {...field} className={inputClass} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </>
                            )}
                        </div>

                        {/* BLOCK CHI PHÍ NHƯ BÊN EDIT */}
                        <div className={cardClass}>
                            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2 text-blue-600 font-bold uppercase text-sm tracking-wider"><Banknote className="h-5 w-5 text-blue-600" /><h3>DỊCH VỤ & CHI PHÍ</h3></div>
                                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-[11px] font-bold border border-blue-100 shadow-sm uppercase tracking-wide"><ShieldCheck className="w-3.5 h-3.5" /><span>{repairCategory === 'CUSTOMER_DEVICE_REPAIR' ? 'Sửa máy khách' : 'Sửa máy kho'}</span></div>
                            </div>

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
                                <Button type="button" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 h-8 text-sm font-semibold -ml-3" onClick={() => append({name: '', price: '', warranty: '0'})}>+ Thêm linh kiện</Button>
                            </div>

                            <div className="mt-auto pt-4 border-t border-slate-100">
                                {repairCategory === 'CUSTOMER_DEVICE_REPAIR' && (
                                    <div className="space-y-4">
                                        <FormField control={form.control} name="repair_price" render={({ field }) => (
                                            <FormItem className="flex items-center justify-between space-y-0">
                                                <div className="flex items-center gap-4">
                                                    <FormLabel className="text-sm font-semibold text-slate-700">Tiền công thợ</FormLabel>
                                                    <FormField control={form.control} name="has_labor_warranty" render={({ field: wField }) => (
                                                        <FormItem className="flex items-center gap-2 space-y-0">
                                                            <FormControl><Switch checked={wField.value} onCheckedChange={wField.onChange} className="data-[state=checked]:bg-blue-600 scale-75 origin-left m-0" /></FormControl>
                                                            <FormLabel className="text-[13px] text-slate-500 font-normal m-0 cursor-pointer">Bảo hành 7 ngày</FormLabel>
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
                                        
                                        {/* HẸN TRẢ MÁY & IN PHIẾU GỘP CHUNG LAYOUT GIỐNG TIỀN CÔNG */}
                                        <div className="flex items-center justify-between space-y-0">
                                            <div className="flex items-center gap-4">
                                                <label className="text-sm font-semibold text-slate-700">
                                                    Hẹn trả máy
                                                </label>
                                                <FormField control={form.control} name="create_appointment" render={({ field }) => (
                                                    <FormItem className="flex items-center gap-2 space-y-0">
                                                        <FormControl>
                                                            <Switch 
                                                                checked={field.value} 
                                                                onCheckedChange={field.onChange} 
                                                                className="data-[state=checked]:bg-blue-600 scale-75 origin-left m-0" 
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="text-[13px] text-slate-500 font-normal m-0 cursor-pointer">
                                                            In phiếu
                                                        </FormLabel>
                                                    </FormItem>
                                                )} />
                                            </div>
                                            
                                            <FormField control={form.control} name="appointment_date" render={({ field }) => (
                                                <FormItem className="space-y-0">
                                                    <FormControl>
                                                        <Input type="datetime-local" {...field} className={`${inputClass} w-40 text-slate-600`} />
                                                    </FormControl>
                                                </FormItem>
                                            )} />
                                        </div>
                                        
                                        <div className="flex justify-between items-end pt-4 mt-2 border-t border-slate-100">
                                            <span className="text-[15px] font-bold text-slate-800">Tổng cộng</span>
                                            <span className="text-2xl font-black text-blue-600">{formatCurrency(totalCost)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <Button type="button" variant="outline" onClick={onCancel} className="h-11 rounded-xl border-slate-300 font-semibold px-6 hover:bg-slate-50">Hủy bỏ</Button>
                    <Button type="submit" disabled={isLoading} className="h-11 rounded-xl bg-blue-600 font-semibold px-7 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Xác nhận
                    </Button>
                </div>
            </form>
        </Form>
    )
}