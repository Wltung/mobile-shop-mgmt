import { redirect } from 'next/navigation'

export default function Home() {
    // Logic: Khi vào trang chủ (root), lập tức đá sang trang /login
    // Sau này nếu có Token rồi thì có thể check để đá sang /dashboard
    redirect('/login')
}
