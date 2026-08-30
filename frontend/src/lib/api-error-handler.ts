import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

export function handleApiError(error: unknown, fallbackMessage = 'Terjadi kesalahan'): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    if (status === 401) {
      toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return 'Unauthorized';
    }

    if (status === 403) {
      return 'Anda tidak memiliki akses untuk melakukan this.';
    }

    if (status === 404) {
      return 'Data tidak ditemukan.';
    }

    if (status === 422) {
      const errors = data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0]?.[0];
        if (firstError) {
          return firstError;
        }
      }
      return data?.message || 'Validasi gagal.';
    }

    if (status && status >= 500) {
      return 'Server error. Silakan coba lagi nanti.';
    }

    return data?.message || axiosError.message || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  return fallbackMessage;
}

export function showApiError(error: unknown, fallbackMessage = 'Terjadi kesalahan'): void {
  const message = handleApiError(error, fallbackMessage);
  toast.error(message);
}

export function extractValidationErrors(error: unknown): Record<string, string> {
  if (axios.isAxiosError(error)) {
    const errors = error.response?.data?.errors;
    if (errors) {
      const extracted: Record<string, string> = {};
      Object.entries(errors).forEach(([field, value]) => {
        extracted[field] = Array.isArray(value) ? String(value[0]) : String(value);
      });
      return extracted;
    }
  }
  return {};
}