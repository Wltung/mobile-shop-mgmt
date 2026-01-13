import { Eye, Trash2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Phone } from '@/types/phone'; 

interface PhoneTableProps {
  phones: Phone[];
  isLoading: boolean;
  formatCurrency: (val: number) => string;
  formatDate: (val: string) => string;
}

export default function PhoneTable({ phones, isLoading, formatCurrency, formatDate }: PhoneTableProps) {
  
  const renderStatus = (status: string) => {
    const styles: Record<string, string> = {
      'IN_STOCK': 'bg-green-100 text-green-800',
      'SOLD': 'bg-slate-100 text-slate-800',
      'REPAIRING': 'bg-yellow-100 text-yellow-800',
    };
    const labels: Record<string, string> = {
      'IN_STOCK': 'Trong kho',
      'SOLD': 'Đã bán',
      'REPAIRING': 'Đang sửa',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold">NGÀY NHẬP</th>
              <th className="px-6 py-4 font-semibold">ĐỜI MÁY</th>
              <th className="px-6 py-4 font-semibold">IMEI</th>
              <th className="px-6 py-4 font-semibold">GIÁ NHẬP</th>
              <th className="px-6 py-4 font-semibold text-center">TRẠNG THÁI</th>
              <th className="px-6 py-4 font-semibold text-center">THAO TÁC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span>Đang tải dữ liệu...</span>
                  </div>
                </td>
              </tr>
            ) : phones.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  Chưa có dữ liệu máy nào.
                </td>
              </tr>
            ) : (
              phones.map((phone) => (
                <tr key={phone.id} className="bg-white hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(phone.created_at)}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{phone.model_name}</td>
                  <td className="px-6 py-4 font-mono text-slate-600">{phone.imei}</td>
                  <td className="px-6 py-4 font-medium">{formatCurrency(phone.purchase_price)}</td>
                  <td className="px-6 py-4 text-center">{renderStatus(phone.status)}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 rounded hover:bg-slate-100 text-slate-500 hover:text-primary transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 rounded hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination component can go here */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6">
           <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
             <p className="text-sm text-slate-700">Hiển thị {phones.length} kết quả</p>
           </div>
      </div>
    </div>
  );
}