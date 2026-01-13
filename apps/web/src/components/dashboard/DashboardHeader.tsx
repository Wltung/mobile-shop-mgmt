// src/components/dashboard/DashboardHeader.tsx
'use client';
import { Menu, Bell, HelpCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface DashboardHeaderProps {
  title: string;
}

export default function DashboardHeader({ title }: DashboardHeaderProps) {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="flex-none flex items-center justify-between whitespace-nowrap border-b border-slate-200 bg-white px-8 py-4 z-10">
      <div className="flex items-center gap-4 text-[#0f172a]">
        <div className="lg:hidden cursor-pointer">
          <Menu className="h-6 w-6" />
        </div>
        <h2 className="text-[#0f172a] text-xl font-bold leading-tight tracking-tight">{title}</h2>
      </div>

      <div className="flex flex-1 justify-end gap-6">
        <div className="flex gap-2 items-center">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[#0f172a] hover:bg-primary/10 hover:text-primary transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[#0f172a] hover:bg-primary/10 hover:text-primary transition-colors">
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
            {user?.full_name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-bold text-[#0f172a]">{user?.full_name || 'Admin'}</span>
            <span className="text-xs text-slate-500 capitalize">{user?.role || 'Staff'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}