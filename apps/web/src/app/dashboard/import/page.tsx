'use client';

import { Search, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePhoneList } from '@/hooks/usePhoneList'; // Import Hook

// Import các Components đã tách
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import PhoneStats from '@/components/phones/PhoneStats';
import PhoneTable from '@/components/phones/PhoneTable';

export default function ImportPage() {
  const { toast } = useToast();
  // Lấy data và logic từ Hook
  const { phones, isLoading, stats, formatCurrency, formatDate } = usePhoneList();

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      
      {/* 1. Header dùng chung */}
      <DashboardHeader title="Quản lý Nhập máy" />

      {/* 2. Content */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-8">
          
          {/* Section: Stats & Action Button */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            
            <PhoneStats 
              totalPhones={stats.totalPhones} 
              totalValue={stats.totalValue} 
              formatCurrency={formatCurrency} 
            />

            <button 
              onClick={() => toast({ title: "Thông báo", description: "Tính năng nhập máy sẽ được cập nhật ở bước sau!" })}
              className="flex-none flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:scale-[1.02]"
            >
              <Plus className="h-5 w-5" />
              <span>Nhập máy mới</span>
            </button>
          </div>

          {/* Section: Search Bar (Có thể tách component nếu muốn) */}
          <div className="w-full">
            <label className="flex flex-col w-full">
              <div className="flex w-full items-stretch rounded-xl h-14 shadow-sm bg-white overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
                <div className="text-slate-400 flex items-center justify-center pl-6">
                  <Search className="h-5 w-5" />
                </div>
                <input 
                  className="flex w-full min-w-0 flex-1 bg-transparent text-[#0f172a] focus:outline-0 border-none h-full placeholder:text-slate-400 px-4 text-base" 
                  placeholder="Tìm kiếm IMEI, tên khách hàng, đời máy..." 
                />
                <div className="flex items-center pr-2">
                  <button className="bg-primary hover:bg-blue-600 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors shadow-sm">
                    Tìm kiếm
                  </button>
                </div>
              </div>
            </label>
          </div>

          {/* Section: Table */}
          <section className="flex flex-col gap-4">
            <h3 className="text-[#0f172a] text-lg font-bold leading-tight">Lịch sử Nhập máy</h3>
            
            <PhoneTable 
              phones={phones} 
              isLoading={isLoading} 
              formatCurrency={formatCurrency} 
              formatDate={formatDate}
            />
          </section>

        </div>
      </div>
    </div>
  );
}