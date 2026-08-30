'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/services/admin';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/shared/empty-state';
import type { PosRegister } from '@/types';
import toast from 'react-hot-toast';

export default function PosRegistersPage() {
  const [registers, setRegisters] = useState<PosRegister[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRegisters = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getPosRegisters({ per_page: 100 });
      setRegisters(response.data.data.registers?.data || []);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal memuat kasir';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegisters();
  }, []);

  const handleOpenRegister = async (id: number) => {
    try {
      await adminApi.openPosRegister(id);
      toast.success('Kasir dibuka');
      fetchRegisters();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal membuka kasir';
      toast.error(message);
    }
  };

  const handleCloseRegister = async (id: number) => {
    try {
      await adminApi.closePosRegister(id);
      toast.success('Kasir ditutup');
      fetchRegisters();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menutup kasir';
      toast.error(message);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Manajemen Kasir POS"
        description="Kelola sesi kasir, saldo pembukaan, dan penutupan."
      />

      <div className="space-y-4">
        {registers.length === 0 ? (
          <EmptyState title="Belum ada kasir POS" description="Tambahkan kasir POS baru untuk memulai transaksi." />
        ) : (
          registers.map((register) => (
            <Card key={register.id}>
              <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    register.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {register.is_active ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{register.name}</h3>
                    <p className="text-sm text-gray-500">{register.location || 'Lokasi tidak ditentukan'}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-gray-500">Saldo Awal</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(register.opening_balance)}</p>
                  </div>
                  {register.closing_balance != null && register.closing_balance > 0 && (
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-gray-500">Saldo Akhir</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(register.closing_balance)}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge status={register.is_active ? 'active' : 'inactive'} />
                    {register.opened_at && (
                      <span className="text-xs text-gray-500">Dibuka: {formatDate(register.opened_at)}</span>
                    )}
                    {register.closed_at && (
                      <span className="text-xs text-gray-500">Ditutup: {formatDate(register.closed_at)}</span>
                    )}
                    {register.is_active ? (
                      <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleCloseRegister(register.id)}>
                        Tutup Kasir
                      </Button>
                    ) : (
                      <Button variant="primary" size="sm" onClick={() => handleOpenRegister(register.id)}>
                        Buka Kasir
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}