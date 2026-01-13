// src/hooks/usePhoneList.ts
import { useState, useEffect } from 'react';
import { phoneService } from '@/services/phone.service';
import { Phone } from '@/types/phone';
import { useToast } from '@/hooks/use-toast';

export const usePhoneList = () => {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchPhones = async () => {
    try {
      setIsLoading(true);
      const res = await phoneService.getAll();
      const sorted = (res.data || []).sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setPhones(sorted);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách điện thoại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhones();
  }, []);

  // Các hàm tiện ích format (có thể tách ra utils nếu muốn dùng chung nhiều nơi)
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('vi-VN');

  // Tính toán Stats
  const stats = {
    totalPhones: phones.length,
    totalValue: phones.reduce((acc, curr) => acc + curr.purchase_price, 0),
  };

  return {
    phones,
    isLoading,
    stats,
    formatCurrency,
    formatDate,
    refresh: fetchPhones,
  };
};