import { Store } from 'lucide-react'

export default function LoginBanner() {
    return (
        <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-primary p-8 lg:flex lg:w-[45%] lg:p-12 xl:w-[40%] xl:p-16">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 z-10 bg-primary/90 mix-blend-multiply" />
                <div
                    className="h-full w-full bg-cover bg-center opacity-60 mix-blend-overlay"
                    style={{
                        backgroundImage:
                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA7qN9swZSlxMCu4d6HDVQJr2njbcA_6kHk4Ux5H0DBXysLcweKSWNElF9mph9vjb8pu4L6KKml94sVfsKCbtSpiAmLgrt98iqXqsqcgeRTMghUCk47X0QbLvXpmEqdC0j1aO99C0M7M78pNgqta6YV0Qqb0P8KbaFP_jDluKteKJX0e_Rgmh6BUrNUaoOaJXFTe8QCPztlxyp9kXji3VMbFjqZ3oZD_zOYEjGKCJrestLPhvDM1n5BE72dD5BsHqcYsZOFYbdAS90F")',
                    }}
                />
            </div>

            {/* Content */}
            <div className="relative z-20 flex h-full flex-col justify-between text-white">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                        <Store className="h-6 w-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">
                        ShopMaster Pro
                    </span>
                </div>

                {/* Hero Text */}
                <div className="mt-12 lg:mb-12 lg:mt-0">
                    <h1 className="mb-6 text-3xl font-black leading-tight tracking-[-0.033em] lg:text-4xl xl:text-5xl">
                        Manage your retail empire seamlessly.
                    </h1>
                    <p className="max-w-md text-lg font-medium leading-relaxed text-white/80 lg:text-xl">
                        Streamline your retail operations, inventory, and sales
                        in one secure platform designed for growth.
                    </p>
                </div>

                {/* Footer Links */}
                <div className="hidden items-center gap-6 text-sm font-medium text-white/60 lg:flex">
                    <span>© 2026 ShopMaster Inc.</span>
                    <a href="#" className="transition-colors hover:text-white">
                        Privacy Policy
                    </a>
                    <a href="#" className="transition-colors hover:text-white">
                        Terms of Service
                    </a>
                </div>
            </div>
        </div>
    )
}
