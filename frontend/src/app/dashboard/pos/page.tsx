'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { PageLoader } from '@/components/ui/spinner';
import { posApi } from '@/lib/services/pos';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { PosTransaction } from '@/types';

export default function PosPage() {
  const [transactions, setTransactions] = useState<PosTransaction[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([posApi.getTransactions(), posApi.getSummary()])
      .then(([transactionsResponse, summaryResponse]) => {
        const payload = transactionsResponse.data.data.transactions;
        setTransactions(payload?.data || []);
        setSummary(summaryResponse.data.data.summary || {});
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="Point of Sale" description="Pantau transaksi kasir dan ringkasan penjualan." />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          ['Transaksi Hari Ini', summary.today_transactions ?? 0],
          ['Pendapatan Hari Ini', formatCurrency(summary.today_revenue ?? 0)],
          ['Pendapatan Bulan Ini', formatCurrency(summary.month_revenue ?? 0)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4 font-semibold text-gray-900">Transaksi Terbaru</div>
        {transactions.length === 0 ? <EmptyState title="Belum ada transaksi POS" /> : (
          <div className="divide-y divide-gray-100">
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between px-5 py-4">
                <div><p className="font-medium text-gray-900">{transaction.transaction_number}</p><p className="text-sm text-gray-500">{formatDate(transaction.created_at)}</p></div>
                <p className="font-semibold text-gray-900">{formatCurrency(transaction.total_amount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
