// src/types/phone.ts

export type PhoneStatus = 'IN_STOCK' | 'SOLD' | 'REPAIRING';

export interface Phone {
  id: number;
  imei: string;
  model_name: string;
  status: PhoneStatus;
  purchase_price: number;
  sale_price?: number;
  note?: string;
  created_at: string; // API trả về string ISO
  details?: Record<string, any>; // JSON dynamic
}

export interface PhoneListResponse {
    message: string;
    data: Phone[];
}