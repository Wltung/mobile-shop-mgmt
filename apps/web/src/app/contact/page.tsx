import ContactBanner from '@/components/contact/ContactBanner'
import ContactForm from '@/components/contact/ContactForm'

export default function ContactPage() {
    return (
        <div className="flex min-h-screen w-full flex-col overflow-hidden font-display lg:flex-row">
            <ContactBanner />
            <ContactForm />
        </div>
    )
}
