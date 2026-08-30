import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function extractPaginated<T>(
  data: Record<string, unknown> | unknown[],
  nestedKey?: string
): { items: T[]; total: number; currentPage: number; lastPage: number } {
  let payload: unknown = data;

  if (nestedKey && payload && typeof payload === 'object' && !Array.isArray(payload) && nestedKey in payload) {
    payload = (payload as Record<string, unknown>)[nestedKey];
  }

  if (Array.isArray(payload)) {
    return { items: payload as T[], total: payload.length, currentPage: 1, lastPage: 1 };
  }

  if (payload && typeof payload === 'object' && 'data' in payload && Array.isArray((payload as PaginatedResponse<T>).data)) {
    const p = payload as PaginatedResponse<T>;
    return { items: p.data, total: p.total, currentPage: p.current_page, lastPage: p.last_page };
  }

  return { items: [], total: 0, currentPage: 1, lastPage: 1 };
}

import type { PaginatedResponse } from '@/types';

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-orange-100 text-orange-800',
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-green-100 text-green-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    completed: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
