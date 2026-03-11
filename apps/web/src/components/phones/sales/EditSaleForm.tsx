'use client'

import { useState, useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, User, Smartphone, CreditCard, FileText } from 'lucide-react'

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

import { editSaleSchema, EditSaleFormValues } from './schema'
import { invoiceService } from '@/services/invoice.service'
import { useToast } from '@/hooks/use-toast'
import { Invoice } from '@/types/invoice'
import { Phone } from '@/types/phone'
import PhoneSearchSelect from '../PhoneSearchSelect'
import { formatDateTimeForInput } from '@/lib/utils'

interface Props {
    invoice: Invoice
    onSuccess: () => void
    onCancel: () => void
}

export default function EditSaleForm({ invoice, onSuccess, onCancel }: Props) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    // Lấy thông tin máy hiện tại trong hoá đơn
    const currentPhoneItem = invoice.items?.find(i => i.item_type === 'PHONE')

    // State lưu thông tin máy đang được chọn (để update UI Màu/Tình trạng)
    const [selectedPhoneDetails, setSelectedPhoneDetails] = useState<{
        color?: string,
        appearance?: string
    } | null>(null)

    const [originalPhonePrice, setOriginalPhonePrice] = useState<number>(
        invoice.total_amount + (invoice.discount ?? 0)
    )

    useEffect(() => {
        if (currentPhoneItem) {
            setSelectedPhoneDetails({
                color: currentPhoneItem.phone_details?.color,
                appearance: currentPhoneItem.phone_details?.appearance
            })
        }
    }, [currentPhoneItem])

    const form = useForm<EditSaleFormValues>({
        resolver: zodResolver(editSaleSchema),
        defaultValues: {
            customer_name: invoice.customer_name || '',
            customer_phone: invoice.customer_phone || '',
            customer_id_number: invoice.customer_id_number || '',
            sale_date: formatDateTimeForInput(invoice.created_at),
            payment_method: invoice.payment_method || 'CASH',
            payment_status: invoice.status === 'PAID' ? 'PAID' : 'DRAFT',
            note: invoice.note || '',
            actual_sale_price: String(invoice.total_amount || 0),
            warranty: String(invoice.items?.[0]?.warranty_months || '6'),
        },
    })

    // --- HÀM ĐỔI MÁY ---
    const handleSelectPhone = (phone: Phone) => {
        setSelectedPhoneDetails({
            color: phone.details?.color,
            appearance: phone.details?.appearance
        })
        form.setValue('phone_id', phone.id) 
        if (phone.sale_price) {
            form.setValue('actual_sale_price', String(phone.sale_price))
            setOriginalPhonePrice(phone.sale_price)
        }
    }

    const watchActualPrice = form.watch('actual_sale_price')
    const discountAmount = originalPhonePrice && watchActualPrice ? originalPhonePrice - Number(watchActualPrice) : 0

    // Thêm formState để lấy isDirty
    const { formState: { isDirty } } = form

    const onSubmit: SubmitHandler<EditSaleFormValues> = async (values) => {
        if (!isDirty) {
            toast({ title: 'Thông báo', description: 'Không có thay đổi nào được thực hiện.' })
            onCancel()
            return
        }

        setIsLoading(true)
        try {
            const payload = {
                ...values,
                // Xử lý ngày: Nếu có giá trị thì format ISO, nếu rỗng thì gửi undefined (để BE không update)
                sale_date: values.sale_date ? new Date(values.sale_date).toISOString() : undefined,
                
                // Xử lý các trường optional khác: Nếu rỗng -> gửi undefined
                customer_id_number: values.customer_id_number || undefined,
                note: values.note || undefined,
                
                // Phone ID: Nếu bằng 0 hoặc không có -> undefined
                phone_id: values.phone_id && values.phone_id > 0 ? values.phone_id : undefined,
                
                // Giá bán: Convert sang string chuẩn, nếu rỗng -> undefined
                actual_sale_price: values.actual_sale_price ? String(values.actual_sale_price) : undefined,
                discount: discountAmount > 0 ? discountAmount : 0,
            }

            await invoiceService.update(invoice.id, payload)

            toast({ title: 'Thành công', description: 'Đã cập nhật đơn hàng.' })
            onSuccess()
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: 'Không thể cập nhật đơn hàng.',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const cardClass = "bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6"
    const iconBoxClass = (color: string) => `size-10 rounded-xl flex items-center justify-center ${color}`
    const inputClass = "h-11 rounded-xl border-slate-200 bg-slate-50/50 shadow-sm focus:border-primary focus:ring-primary focus:bg-white transition-all font-medium text-slate-800"
    const labelClass = "text-sm font-semibold text-slate-700 mb-1.5 block"

    // LOGIC KHOÁ: Nếu đã thanh toán (PAID) thì khoá
    const isLocked = invoice.status === 'PAID'

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
                
                <div className="max-h-[70vh] flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
                    {/* Cảnh báo nếu bị khoá */}
                    {isLocked && (
                        <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 flex items-center gap-3 text-blue-800 mb-2">
                            <Smartphone className="h-5 w-5" />
                            <span className="text-sm">Đơn hàng đã <b>được chốt thanh toán</b>. Bạn chỉ có thể chỉnh sửa Ghi chú.</span>
                        </div>
                    )}
                    
                    {/* 1. THÔNG TIN KHÁCH HÀNG */}
                    <div className={cardClass}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={iconBoxClass("bg-blue-50 text-blue-600")}>
                                <User className="h-5 w-5" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-800">Thông tin khách hàng</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                control={form.control}
                                name="customer_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelClass}>Họ tên khách hàng</FormLabel>
                                        <FormControl><Input {...field} className={inputClass} disabled={isLocked} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="customer_phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelClass}>Số điện thoại</FormLabel>
                                        <FormControl><Input {...field} className={inputClass} disabled={isLocked} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="customer_id_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelClass}>CCCD</FormLabel>
                                        <FormControl><Input {...field} placeholder="Số căn cước..." className={inputClass} disabled={isLocked} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* 2. THÔNG TIN MÁY BÁN */}
                    <div className={cardClass}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={iconBoxClass("bg-indigo-50 text-indigo-600")}>
                                <Smartphone className="h-5 w-5" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-800">Thông tin máy bán</h4>
                        </div>

                        {/* --- COMPONENT TÌM KIẾM MÁY (ĐỔI MÁY) --- */}
                        <PhoneSearchSelect 
                            label="Tìm kiếm máy (Đổi máy)"
                            placeholder="Nhập IMEI hoặc tên máy để tìm..."
                            // Kiểm tra kỹ null check ở đây
                            initialValue={currentPhoneItem ? `${currentPhoneItem.description} - IMEI: ${currentPhoneItem.imei || ''}` : ''}
                            onSelect={handleSelectPhone}
                            disabled={isLocked}
                        />

                        <div className="flex flex-col gap-6">
                            {/* HÀNG 1: Màu sắc - Giá bán niêm yết */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className={labelClass}>Màu sắc</label>
                                    <Input readOnly value={selectedPhoneDetails?.color || '---'} className={`${inputClass} bg-slate-100 text-slate-500`} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelClass}>Giá bán niêm yết</label>
                                    <div className="h-11 flex items-center px-4 rounded-xl border border-slate-200 bg-slate-50/70 font-bold text-slate-600 shadow-sm">
                                        {originalPhonePrice ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPhonePrice) : '---'}
                                    </div>
                                </div>
                            </div>

                            {/* HÀNG 2: Tình trạng - Bảo hành */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className={labelClass}>Tình trạng máy</label>
                                    <Input readOnly value={selectedPhoneDetails?.appearance || '---'} className={`${inputClass} bg-slate-100 text-slate-500`} />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="warranty"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={labelClass}>Thời gian bảo hành</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLocked}>
                                                <FormControl><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="0">Không bảo hành</SelectItem>
                                                    <SelectItem value="3">3 tháng</SelectItem>
                                                    <SelectItem value="6">6 tháng</SelectItem>
                                                    <SelectItem value="12">12 tháng</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 3. THANH TOÁN */}
                    <div className={cardClass}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={iconBoxClass("bg-green-50 text-green-600")}>
                                <CreditCard className="h-5 w-5" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-800">Thông tin thanh toán</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                control={form.control}
                                name="sale_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelClass}>Ngày bán</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} className={`block ${inputClass}`} disabled={isLocked} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="payment_method"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={labelClass}>Hình thức thanh toán</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLocked}>
                                            <FormControl><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="CASH">Tiền mặt</SelectItem>
                                                <SelectItem value="TRANSFER">Chuyển khoản</SelectItem>
                                                <SelectItem value="CARD">Quẹt thẻ</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="actual_sale_price"
                                render={({ field }) => (
                                    <FormItem>
                                        {/* Đổi nhãn thành Giá bán thực tế */}
                                        <FormLabel className={labelClass}>Giá bán thực tế</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input {...field} className={`${inputClass} pr-10 font-bold text-primary`} disabled={isLocked} />
                                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                    <span className="text-slate-400 font-bold">₫</span>
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                        
                                        {/* BỔ SUNG HIỂN THỊ SỐ TIỀN GIẢM GIÁ CHỈ KHI ĐANG SỬA */}
                                        {discountAmount > 0 && !isLocked && (
                                            <div className="text-[12px] font-bold text-emerald-600 mt-2 flex items-center gap-1.5">
                                                <span className="bg-emerald-100/60 px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">Đã giảm</span>
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}
                                            </div>
                                        )}
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* 4. GHI CHÚ */}
                    <div className={cardClass}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={iconBoxClass("bg-orange-50 text-orange-600")}>
                                <FileText className="h-5 w-5" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-800">Ghi chú & Dặn dò</h4>
                        </div>
                        <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea 
                                            {...field} 
                                            placeholder="Nhập ghi chú quan trọng cho đơn hàng này..." 
                                            className="w-full rounded-xl border-slate-200 bg-slate-50/50 shadow-sm focus:border-primary focus:ring-primary min-h-[100px] p-4 font-medium text-slate-800" 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                </div>

                <div className="px-8 py-5 bg-white border-t border-slate-200 flex justify-end gap-3 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onCancel} 
                        className="h-11 px-6 rounded-xl border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                    >
                        Hủy bỏ
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={isLoading} 
                        className="h-11 px-8 rounded-xl bg-primary hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20"
                    >
                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                        Lưu thay đổi
                    </Button>
                </div>
            </form>
        </Form>
    )
}