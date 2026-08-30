import api from '@/lib/api';
import type { ApiResponse, PosTransaction, Product, PaginatedResponse } from '@/types';

export const posApi = {
  getTransactions: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ transactions: PaginatedResponse<PosTransaction> }>>('/v1/pos/transactions', { params }),

  getTransaction: (transactionNumber: string) =>
    api.get<ApiResponse<{ transaction: PosTransaction }>>(`/v1/pos/transactions/${transactionNumber}`),

  createTransaction: (data: {
    customer_id?: number;
    items: Array<{ product_id: number; quantity: number; discount?: number }>;
    payment_method: string;
    payment_amount: number;
    discount_amount?: number;
    notes?: string;
  }) =>
    api.post<ApiResponse<{ transaction: PosTransaction }>>('/v1/pos/transactions', data),

  getSummary: () =>
    api.get<ApiResponse<{ summary: Record<string, number> }>>('/v1/pos/summary'),

  getProducts: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ products: Product[] }>>('/v1/pos/products', { params }),
};
