import LoginBanner from '@/components/auth/LoginBanner'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
    return (
        <div className="flex min-h-screen w-full flex-col overflow-hidden font-display lg:flex-row">
            <LoginBanner />
            <LoginForm />
        </div>
    )
}
