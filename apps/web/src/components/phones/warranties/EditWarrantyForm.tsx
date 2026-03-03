'use client'

import { useState, useMemo } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, ShieldCheck, User, Smartphone, AlertTriangle, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

import { editWarrantySchema, EditWarrantyValues } from './schema'
import { warrantyService } from '@/services/warranty.service'
import { useToast } from '@/hooks/use-toast'
import { Warranty } from '@/types/warranty'
import { formatDateForInput } from '@/lib/utils'

interface Props {
    warranty: Warranty
    onSuccess: () => void
    onCancel: () => void
}

// Hàm bóc tách dữ liệu (giống ở trang Chi tiết)
const parseDescription = (desc?: string) => {
    if (!desc) return { receiveStatus: '', customerFaultNote: '' }
    if (!desc.includes('[Tình trạng máy khi nhận]')) return { receiveStatus: '', customerFaultNote: desc }
    const parts = desc.split('\n\n[Lỗi khách thông báo]\n')
    return {
        receiveStatus: parts[0].replace('[Tình trạng máy khi nhận]\n', '').trim(),
        customerFaultNote: parts[1] ? parts[1].trim() : ''
    }
}

const parseTechnicalNote = (note?: string) => {
    if (!note) return { specialNote: '', warrantyCondition: '' }
    if (!note.includes('[Ghi chú đặc biệt]')) return { specialNote: note, warrantyCondition: '' }
    const parts = note.split('\n\n[Điều kiện bảo hành]\n')
    return {
        specialNote: parts[0].replace('[Ghi chú đặc biệt]\n', '').trim(),
        warrantyCondition: parts[1] ? parts[1].trim() : ''
    }
}

export default function EditWarrantyForm({ warranty, onSuccess, onCancel }: Props) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const parsedData = useMemo(() => {
        const desc = parseDescription(warranty.description)
        const tech = parseTechnicalNote(warranty.technical_note)
        return { ...desc, ...tech }
    }, [warranty])

    const form = useForm<EditWarrantyValues>({
        resolver: zodResolver(editWarrantySchema),
        defaultValues: {
            status: warranty.status as any,
            cost: warranty.cost ? String(warranty.cost) : '0',
            receive_status: parsedData.receiveStatus,
            customer_fault_note: parsedData.customerFaultNote,
            special_note: parsedData.specialNote,
            warranty_condition: parsedData.warrantyCondition,
        },
    })

    const { isDirty } = form.formState

    const onSubmit: SubmitHandler<EditWarrantyValues> = async (values) => {
        if (!isDirty) {
            toast({ title: 'Thông báo', description: 'Không có thay đổi nào được thực hiện.' })
            onCancel()
            return
        }

        setIsLoading(true)
        try {
            // Đóng gói lại chuỗi trước khi gửi
            const finalDescription = `[Tình trạng máy khi nhận]\n${values.receive_status || 'Không ghi chú'}\n\n[Lỗi khách thông báo]\n${values.customer_fault_note}`
            const finalTechnicalNote = `[Ghi chú đặc biệt]\n${values.special_note || 'Không có'}\n\n[Điều kiện bảo hành]\n${values.warranty_condition || 'Theo quy định chuẩn'}`

            const payload = {
                status: values.status,
                cost: Number(values.cost),
                description: finalDescription,
                technical_note: finalTechnicalNote,
            }

            await warrantyService.update(warranty.id, payload)
            toast({ title: 'Thành công', description: 'Đã cập nhật phiếu bảo hành.' })
            onSuccess()
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Lỗi', description: error.response?.data?.error || 'Không thể cập nhật phiếu.' })
        } finally {
            setIsLoading(false)
        }
    }

    const inputClass = 'h-10 rounded-lg border-slate-200 text-slate-800 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed'
    const labelClass = 'block text-[13px] font-semibold text-slate-700 mb-1.5'
    const headerClass = 'flex items-center gap-2 text-sm font-bold tracking-wide uppercase mb-4'

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col bg-white">
                <div className="max-h-[70vh] flex-1 overflow-y-auto p-6 space-y-8">
                    
                    {/* BLOCK 1: THÔNG TIN TIẾP NHẬN (BLUE) */}
                    <div className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
                        <div className={`${headerClass} text-blue-600`}><ShieldCheck className="h-5 w-5" /> THÔNG TIN TIẾP NHẬN</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <FormField control={form.control} name="status" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelClass}>Trạng thái <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="RECEIVED">Đã tiếp nhận</SelectItem>
                                            <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                                            <SelectItem value="DONE">Đã trả khách</SelectItem>
                                            <SelectItem value="CANCELLED">Đã huỷ</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )} />
                            <div className="space-y-1.5">
                                <label className={labelClass}>Ngày tiếp nhận <span className="text-red-500">*</span></label>
                                {/* Khoá sửa ngày tiếp nhận theo yêu cầu */}
                                <Input type="date" value={formatDateForInput(warranty.created_at)} disabled className={inputClass} />
                            </div>
                            <FormField control={form.control} name="cost" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelClass}>Chi phí phát sinh</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">₫</span>
                                            <Input type="number" {...field} className={`${inputClass} pl-8`} />
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )} />
                        </div>
                    </div>

                    {/* BLOCK 2: KHÁCH HÀNG (READ-ONLY) */}
                    <div className="space-y-4">
                        <div className={`${headerClass} text-slate-500`}><User className="h-5 w-5" /> THÔNG TIN KHÁCH HÀNG (READ-ONLY)</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="space-y-1.5"><label className={labelClass}>Họ và tên</label><Input value={warranty.customer_name || '---'} disabled className={inputClass} /></div>
                            <div className="space-y-1.5"><label className={labelClass}>Số điện thoại</label><Input value={warranty.customer_phone || '---'} disabled className={inputClass} /></div>
                            <div className="space-y-1.5"><label className={labelClass}>CCCD</label><Input value="---" disabled className={inputClass} /></div>
                        </div>
                    </div>

                    {/* BLOCK 3: THIẾT BỊ (READ-ONLY) */}
                    <div className="space-y-4">
                        <div className={`${headerClass} text-slate-500`}><Smartphone className="h-5 w-5" /> THÔNG TIN THIẾT BỊ (READ-ONLY)</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5"><label className={labelClass}>Đời máy</label><Input value={warranty.device_name || '---'} disabled className={inputClass} /></div>
                            <div className="space-y-1.5"><label className={labelClass}>Loại bảo hành</label><Input value={warranty.type === 'SALE' ? 'Bán máy' : 'Sửa chữa'} disabled className={inputClass} /></div>
                            <div className="space-y-1.5"><label className={labelClass}>IMEI</label><Input value={warranty.imei || '---'} disabled className={`${inputClass} font-mono`} /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5"><label className={labelClass}>Ngày kích hoạt</label><Input type="date" value={formatDateForInput(warranty.start_date)} disabled className={inputClass} /></div>
                                <div className="space-y-1.5"><label className={labelClass}>Ngày hết hạn</label><Input type="date" value={formatDateForInput(warranty.end_date)} disabled className={inputClass} /></div>
                            </div>
                        </div>
                    </div>

                    {/* BLOCK 4: THÔNG TIN LỖI (RED) */}
                    <div className="rounded-xl border border-red-100 bg-white p-5 shadow-sm space-y-4">
                        <div className={`${headerClass} text-red-600`}><AlertTriangle className="h-5 w-5" /> THÔNG TIN TIẾP NHẬN LỖI</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormField control={form.control} name="customer_fault_note" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelClass}>Lỗi khách thông báo <span className="text-red-500">*</span></FormLabel>
                                    <FormControl><Textarea {...field} rows={3} className="resize-none" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="receive_status" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelClass}>Tình trạng máy khi nhận</FormLabel>
                                    <FormControl><Textarea {...field} rows={3} className="resize-none" /></FormControl>
                                </FormItem>
                            )} />
                        </div>
                    </div>

                    {/* BLOCK 5: GHI CHÚ (AMBER) */}
                    <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-5 shadow-sm space-y-4">
                        <div className={`${headerClass} text-amber-600`}><FileText className="h-5 w-5" /> GHI CHÚ & ĐIỀU KIỆN</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormField control={form.control} name="special_note" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelClass}>Ghi chú đặc biệt</FormLabel>
                                    <FormControl><Textarea {...field} rows={3} className="resize-none bg-white" /></FormControl>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="warranty_condition" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelClass}>Điều kiện bảo hành</FormLabel>
                                    <FormControl><Textarea {...field} rows={3} className="resize-none bg-white" /></FormControl>
                                </FormItem>
                            )} />
                        </div>
                    </div>

                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 shrink-0">
                    <Button type="button" variant="outline" onClick={onCancel} className="h-10 px-6 rounded-lg font-semibold text-slate-700">Hủy</Button>
                    <Button type="submit" disabled={isLoading} className="h-10 px-8 rounded-lg bg-blue-600 font-semibold text-white shadow-md hover:bg-blue-700">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Lưu thay đổi
                    </Button>
                </div>
            </form>
        </Form>
    )
}