'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { erpApi } from '@/lib/services/erp';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/shared/empty-state';
import type { Invoice } from '@/types';
import { useEffect, useState } from 'react';

export default function DashboardInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    erpApi.getInvoices({ per_page: 50 })
      .then((response) => setInvoices(response.data.data.invoices?.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="Invoice" description="Kelola faktur penjualan dan pembelian dengan status jatuh tempo." />

      <div className="space-y-4">
        {invoices.length === 0 ? <EmptyState title="Belum ada invoice" description="Invoice bisnis akan muncul di sini." /> : invoices.map((invoice) => (
          <Card key={invoice.id}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-gray-500">{invoice.invoice_number}</p>
                  <h3 className="text-lg font-semibold text-gray-900">{invoice.customer?.name || 'Pelanggan'}</h3>
                  <p className="text-sm text-gray-500">Jatuh tempo {formatDate(invoice.due_date)}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge status={invoice.status} />
                  <span className="text-sm text-gray-500 uppercase tracking-wide">{invoice.type}</span>
                  <span className="text-base font-bold text-gray-900">{formatCurrency(invoice.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
