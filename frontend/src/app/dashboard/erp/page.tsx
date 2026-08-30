'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { PageLoader } from '@/components/ui/spinner';
import { erpApi } from '@/lib/services/erp';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import type { Invoice } from '@/types';

export default function ErpPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [overdueCount, setOverdueCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([erpApi.getInvoices(), erpApi.getInvoiceSummary()])
      .then(([invoicesResponse, summaryResponse]) => {
        setInvoices(invoicesResponse.data.data.invoices?.data || []);
        setSummary(summaryResponse.data.data.summary || {});
        setOverdueCount(summaryResponse.data.data.overdue_count || 0);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="Enterprise Resource Planning" description="Kelola invoice dan arus administrasi bisnis." />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          ['Total Invoice', summary.total_invoices ?? invoices.length],
          ['Belum Dibayar', formatCurrency(summary.remaining_amount ?? 0)],
          ['Jatuh Tempo', overdueCount],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4 font-semibold text-gray-900">Invoice Terbaru</div>
        {invoices.length === 0 ? <EmptyState title="Belum ada invoice" /> : (
          <div className="divide-y divide-gray-100">
            {invoices.slice(0, 10).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between px-5 py-4">
                <div><p className="font-medium text-gray-900">{invoice.invoice_number}</p><p className="text-sm text-gray-500">Jatuh tempo {formatDateShort(invoice.due_date)}</p></div>
                <div className="text-right"><p className="font-semibold text-gray-900">{formatCurrency(invoice.total_amount)}</p><p className="text-xs capitalize text-gray-500">{invoice.status}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
