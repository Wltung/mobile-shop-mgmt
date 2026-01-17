'use client'

import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

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
import { invoiceService } from '@/services/invoice.service'

interface Props {
    onSuccess: () => void
    onCancel: () => void
}

export default function ImportPhoneForm({ onSuccess, onCancel }: Props) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const form = useForm<ImportFormValues>({
        resolver: zodResolver(importSchema),
        defaultValues: defaultImportValues,
    })

    const onSubmit: SubmitHandler<ImportFormValues> = async (values) => {
        setIsLoading(true)
        try {
            const priceNumber = Number(values.purchase_price)

            const payload = {
                imei: values.imei,
                model_name: values.model_name,
                purchase_price: priceNumber,
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
                    accessories: values.accessories,
                },
            }

            const res = await phoneService.create(payload)

            if (values.create_invoice) {
                const customerId = res.source_id
                await invoiceService.create({
                    type: 'IMPORT',
                    status: 'PAID',
                    customer_id: customerId,
                    note: `Phiếu nhập kho cho ${values.model_name} (IMEI: ${values.imei})`,
                    items: [
                        {
                            item_type: 'PHONE',
                            phone_id: res.phone_id,
                            description: values.model_name,
                            quantity: 1,
                            unit_price: priceNumber,
                            warranty_months: 0,
                        },
                    ],
                })
                toast({
                    variant: 'default',
                    title: 'Thành công',
                    description: 'Đã nhập máy và tạo hóa đơn thanh toán.',
                })
            } else {
                toast({
                    variant: 'default',
                    title: 'Thành công',
                    description: 'Đã nhập máy vào kho (Không tạo hóa đơn).',
                })
            }

            onSuccess()
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error.response?.data?.error || 'Không thể nhập máy',
            })
        } finally {
            setIsLoading(false)
        }
    }

    // --- STYLE CHO INPUT ---
    const inputClass = "bg-slate-100 border-transparent h-11 font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus-visible:bg-white focus-visible:border-primary focus-visible:ring-0 transition-all shadow-sm"

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full bg-slate-50/50">
                
                {/* Scroll Container - Giữ nguyên max-h-[70vh] theo file bạn gửi để không mất scroll */}
                <div className="max-h-[70vh] overflow-y-auto px-8 py-6 pb-10 space-y-6">
                    
                    {/* SECTION 1: THÔNG TIN MÁY */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
                            <div className="h-7 w-7 rounded-full bg-blue-50 text-primary flex items-center justify-center font-bold text-sm">1</div>
                            <h4 className="font-bold text-slate-800 uppercase text-sm tracking-wide">Thông tin máy</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="model_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Đời máy <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ví dụ: iPhone 15 Pro Max" {...field} className={inputClass} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="imei"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">IMEI <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="15 số IMEI" maxLength={15} {...field} className={`${inputClass} font-mono`} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Trạng thái</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className={inputClass}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="IN_STOCK">Trong kho</SelectItem>
                                                <SelectItem value="REPAIRING">Đang sửa</SelectItem>
                                                <SelectItem value="SOLD">Đã bán</SelectItem>
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
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Giá nhập <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input type="number" placeholder="0" {...field} className={inputClass} />
                                                <span className="absolute right-3 top-3 text-sm font-medium text-slate-500">VND</span>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Ngày nhập - Sửa: Bỏ w-1/2 để full width, giúp icon lịch nằm sát phải */}
                            <div className="md:col-span-2">
                                <FormField
                                    control={form.control}
                                    name="import_date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="text-slate-700 font-semibold text-sm">Ngày nhập</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} className={`${inputClass} block w-full sm:w-1/2 py-3`} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: NGƯỜI BÁN */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
                            <div className="h-7 w-7 rounded-full bg-blue-50 text-primary flex items-center justify-center font-bold text-sm">2</div>
                            <h4 className="font-bold text-slate-800 uppercase text-sm tracking-wide">Người bán</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                control={form.control}
                                name="seller_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Họ tên người bán</FormLabel>
                                        <FormControl><Input placeholder="Nguyễn Văn A" {...field} className={inputClass} /></FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="seller_phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Số điện thoại</FormLabel>
                                        <FormControl><Input type="tel" placeholder="09xx..." {...field} className={inputClass} /></FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="seller_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Số CCCD</FormLabel>
                                        <FormControl><Input type="text" placeholder="12 số..." {...field} className={inputClass} /></FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* SECTION 3: CHI TIẾT KỸ THUẬT */}
                    {/* SỬA: Đổi thành grid-cols-3 theo yêu cầu */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
                            <div className="h-7 w-7 rounded-full bg-blue-50 text-primary flex items-center justify-center font-bold text-sm">3</div>
                            <h4 className="font-bold text-slate-800 uppercase text-sm tracking-wide">Chi tiết kỹ thuật</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* MÀU SẮC: Sửa thành Input nhập tay */}
                            <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-500 font-semibold text-xs uppercase">Màu sắc</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ví dụ: Titanium Blue" {...field} className={inputClass} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="storage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-500 font-semibold text-xs uppercase">Dung lượng</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className={inputClass}>
                                                    <SelectValue placeholder="Chọn" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {['64GB', '128GB', '256GB', '512GB', '1TB'].map(s => (
                                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                                ))}
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
                                        <FormLabel className="text-slate-500 font-semibold text-xs uppercase">Pin (%)</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                placeholder="100" 
                                                {...field} 
                                                value={field.value ?? ''} 
                                                onChange={(e) => field.onChange(e.target.value)} 
                                                className={inputClass}
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
                                        <FormLabel className="text-slate-500 font-semibold text-xs uppercase">Ngoại quan</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className={inputClass}>
                                                    <SelectValue placeholder="Chọn" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="New Seal">New Seal</SelectItem>
                                                <SelectItem value="Like New (99%)">Like New (99%)</SelectItem>
                                                <SelectItem value="98%">98% (Xước phẩy)</SelectItem>
                                                <SelectItem value="95%">95% (Cấn móp)</SelectItem>
                                                <SelectItem value="Xấu">Xấu</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* GHI CHÚ */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                         <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-800 font-bold text-sm uppercase">Ghi chú</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Nhập ghi chú chi tiết về tình trạng máy..." rows={3} {...field} className={inputClass} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                </div>

                {/* --- FOOTER STICKY --- */}
                <div className="bg-white px-8 py-5 border-t border-slate-200 flex items-center justify-between sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                     <FormField
                        control={form.control}
                        name="create_invoice"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                    <label className="relative inline-flex cursor-pointer items-center group select-none">
                                        <input type="checkbox" className="peer sr-only" checked={field.value} onChange={field.onChange} />
                                        <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-sidebar peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sidebar/20"></div>
                                        <span className="ml-3 text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">
                                            Tạo hoá đơn nhập hàng
                                        </span>
                                    </label>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    
                    <div className="flex items-center gap-3">
                        <Button type="button" variant="outline" onClick={onCancel} className="h-10 px-6 border-slate-300 font-medium text-slate-600">
                            Hủy bỏ
                        </Button>
                        <Button type="submit" disabled={isLoading} className="h-10 px-8 bg-sidebar hover:bg-sidebar-hover text-white font-bold">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Xác nhận nhập kho
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}