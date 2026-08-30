'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ecommerceApi } from '@/lib/services/ecommerce';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/shared/empty-state';
import type { Order } from '@/types';
import { useEffect, useState } from 'react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ecommerceApi.getOrders()
      .then((response) => setOrders(response.data.data.orders?.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="Pesanan Saya" description="Riwayat pembelian dan status pengiriman produk." />

      <div className="space-y-4">
        {orders.length === 0 ? <EmptyState title="Belum ada pesanan" description="Riwayat pesanan Anda akan muncul setelah checkout." /> : orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <p className="text-sm text-gray-500">#{order.order_number}</p>
                  <h3 className="text-lg font-semibold text-gray-900">Pesanan {order.order_number}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={order.status} />
                  <span className="text-sm font-medium text-gray-700">{formatCurrency(order.total_amount)}</span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-gray-600 md:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Tanggal</p>
                  <p className="mt-1 font-medium text-gray-800">{formatDate(order.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Metode Pembayaran</p>
                  <p className="mt-1 font-medium capitalize text-gray-800">{order.payment_method.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Alamat</p>
                  <p className="mt-1 font-medium text-gray-800">
                    {order.shipping_address?.city}, {order.shipping_address?.province}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
