'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { adminApi } from '@/lib/services/admin';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/shared/empty-state';
import type { Order } from '@/types';
import { useEffect, useState } from 'react';

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getOrders({ per_page: 50 })
      .then((response) => setOrders(response.data.data.orders?.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="Pesanan" description="Pantau status pesanan pelanggan dan pembayaran." />

      <div className="space-y-4">
        {orders.length === 0 ? <EmptyState title="Belum ada pesanan" description="Pesanan dari pelanggan akan muncul di sini." /> : orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-gray-500">#{order.order_number}</p>
                  <h3 className="text-lg font-semibold text-gray-900">{order.user?.name}</h3>
                  <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge status={order.status} />
                  <Badge status={order.payment_status} className="bg-amber-100 text-amber-700" />
                  <span className="text-base font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
