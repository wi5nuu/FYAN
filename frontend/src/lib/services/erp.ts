import api from '@/lib/api';
import type { ApiResponse, Invoice, PurchaseOrder, PaginatedResponse } from '@/types';

export const erpApi = {
  getInvoices: (params?: Record<string, string | number | boolean>) =>
    api.get<ApiResponse<{ invoices: PaginatedResponse<Invoice> }>>('/v1/erp/invoices', { params }),

  getInvoice: (invoiceNumber: string) =>
    api.get<ApiResponse<{ invoice: Invoice }>>(`/v1/erp/invoices/${invoiceNumber}`),

  createInvoice: (data: {
    customer_id: number;
    type: string;
    due_date: string;
    items: Array<{ description: string; quantity: number; unit_price: number }>;
  }) =>
    api.post<ApiResponse<{ invoice: Invoice }>>('/v1/erp/invoices', data),

  recordPayment: (invoiceNumber: string, data: { amount: number; payment_method: string; reference?: string }) =>
    api.post(`/v1/erp/invoices/${invoiceNumber}/payment`, data),

  getInvoiceSummary: () =>
    api.get<ApiResponse<{ summary: Record<string, number>; overdue_count: number }>>('/v1/erp/invoices/summary'),

  getPurchaseOrders: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ purchase_orders: PaginatedResponse<PurchaseOrder> }>>('/v1/erp/purchase-orders', { params }),

  getPurchaseOrder: (poNumber: string) =>
    api.get<ApiResponse<{ purchase_order: PurchaseOrder }>>(`/v1/erp/purchase-orders/${poNumber}`),

  createPurchaseOrder: (data: {
    supplier_id: number;
    expected_date?: string;
    items: Array<{ product_id: number; quantity: number; unit_price: number }>;
  }) =>
    api.post('/v1/erp/purchase-orders', data),

  approvePurchaseOrder: (poNumber: string) =>
    api.post(`/v1/erp/purchase-orders/${poNumber}/approve`),

  receivePurchaseOrder: (poNumber: string) =>
    api.post(`/v1/erp/purchase-orders/${poNumber}/receive`),

  cancelPurchaseOrder: (poNumber: string) =>
    api.post(`/v1/erp/purchase-orders/${poNumber}/cancel`),
};
