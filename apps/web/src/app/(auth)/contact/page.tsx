import ContactBanner from '@/components/auth/ContactBanner'
import ContactForm from '@/components/auth/ContactForm'

export default function ContactPage() {
    return (
        <div className="flex min-h-screen w-full flex-col overflow-hidden font-display lg:flex-row">
            <ContactBanner />
            <ContactForm />
        </div>
    )
}
