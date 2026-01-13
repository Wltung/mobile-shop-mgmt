import { Package, DollarSign } from 'lucide-react';

interface PhoneStatsProps {
  totalPhones: number;
  totalValue: number;
  formatCurrency: (val: number) => string;
}

export default function PhoneStats({ totalPhones, totalValue, formatCurrency }: PhoneStatsProps) {
  return (
    <div className="flex flex-1 gap-4 flex-wrap">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm min-w-[200px]">
        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
          <Package className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Tổng máy kho</span>
          <span className="text-lg font-bold text-[#0f172a]">{totalPhones} máy</span>
        </div>
      </div>
      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm min-w-[200px]">
        <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
          <DollarSign className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Tổng giá trị nhập</span>
          <span className="text-lg font-bold text-[#0f172a]">{formatCurrency(totalValue)}</span>
        </div>
      </div>
    </div>
  );
}