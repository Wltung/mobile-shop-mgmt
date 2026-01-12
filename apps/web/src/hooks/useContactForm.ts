import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import emailjs from '@emailjs/browser'
import { useToast } from '@/hooks/use-toast'

// 1. Define Schema Validation
const contactSchema = z.object({
    fullName: z.string().min(2, 'Vui lòng nhập họ tên đầy đủ'),
    phone: z
        .string()
        .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/g, 'Số điện thoại không hợp lệ'),
    storeName: z.string().min(1, 'Vui lòng nhập tên cửa hàng'),
    email: z.string().email('Email không đúng định dạng'),
    message: z.string().min(10, 'Lời nhắn quá ngắn (tối thiểu 10 ký tự)'),
})

export type ContactFormValues = z.infer<typeof contactSchema>

export const useContactForm = () => {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            fullName: '',
            phone: '',
            storeName: '',
            email: '',
            message: '',
        },
    })

    const onSubmit = async (values: ContactFormValues) => {
        setIsLoading(true)
        try {
            // --- CẤU HÌNH EMAILJS ---
            const SERVICE_ID = 'service_qp48uzs'
            const TEMPLATE_ID = 'template_8csh1zg'
            const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

            // Gửi mail
            await emailjs.send(
                SERVICE_ID,
                TEMPLATE_ID,
                {
                    to_name: 'Admin',
                    from_name: values.fullName,
                    phone: values.phone,
                    store_name: values.storeName,
                    reply_to: values.email,
                    message: values.message,
                },
                PUBLIC_KEY,
            )

            toast({
                title: 'Gửi yêu cầu thành công!',
                description:
                    'Bộ phận kỹ thuật sẽ liên hệ lại trong vòng 5 phút.',
                variant: 'success',
                className: 'bg-green-600 text-white border-none',
            })

            form.reset() // Reset form sau khi gửi xong
        } catch (error) {
            console.error(error)
            toast({
                title: 'Gửi thất bại',
                description:
                    'Có lỗi xảy ra, vui lòng thử lại hoặc gọi hotline.',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return {
        form,
        isLoading,
        onSubmit: form.handleSubmit(onSubmit),
    }
}
