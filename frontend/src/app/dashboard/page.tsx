'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { adminApi } from '@/lib/services/admin';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { demoOrders, demoProducts } from '@/lib/mock-data';
import type { DashboardStats, Order, Product } from '@/types';
import toast from 'react-hot-toast';

interface ChartPoint {
  date: string;
  ecommerce: number;
  pos: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [dashboardRes, ordersRes, chartRes, lowStockRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getRecentOrders(),
        adminApi.getRevenueChart(30),
        adminApi.getLowStock(),
      ]);

      setStats(dashboardRes.data.data.stats);
      setRecentOrders(ordersRes.data.data.orders || []);
      setLowStockProducts(lowStockRes.data.data.products || []);

      const { ecommerce, pos } = chartRes.data.data;
      const dateMap = new Map<string, ChartPoint>();

      ecommerce?.forEach((item) => {
        dateMap.set(item.date, { date: item.date, ecommerce: item.revenue, pos: 0 });
      });
      pos?.forEach((item) => {
        const existing = dateMap.get(item.date);
        if (existing) {
          existing.pos = item.revenue;
        } else {
          dateMap.set(item.date, { date: item.date, ecommerce: 0, pos: item.revenue });
        }
      });

      const sorted = Array.from(dateMap.values()).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setChartData(sorted);
    } catch {
      const fallbackStats: DashboardStats = {
        users: 128,
        active_users: 89,
        products: demoProducts.length,
        active_products: demoProducts.length,
        low_stock_products: demoProducts.filter((product) => product.stock_quantity <= (product.min_stock ?? 5)).length,
        orders: demoOrders.length,
        pending_orders: demoOrders.filter((order) => order.status === 'pending').length,
        revenue: demoOrders.reduce((sum, order) => sum + order.total_amount, 0),
        pos_transactions: 46,
        pos_revenue: 198000000,
        invoices: 12,
        overdue_invoices: 3,
        posts: 19,
        published_posts: 16,
        customers: 84,
      };

      setStats(fallbackStats);
      setRecentOrders(demoOrders);
      setLowStockProducts(demoProducts.filter((product) => product.stock_quantity <= (product.min_stock ?? 5)));
      setChartData([
        { date: '2026-08-01', ecommerce: 4200000, pos: 3100000 },
        { date: '2026-08-05', ecommerce: 5100000, pos: 3900000 },
        { date: '2026-08-10', ecommerce: 6400000, pos: 4200000 },
        { date: '2026-08-15', ecommerce: 7600000, pos: 5000000 },
        { date: '2026-08-20', ecommerce: 8900000, pos: 6100000 },
        { date: '2026-08-25', ecommerce: 9800000, pos: 6600000 },
      ]);
      toast.error('API backend tidak tersedia, menampilkan data demo dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Pengguna"
          value={stats?.users || 0}
          subtitle={`${stats?.active_users || 0} aktif`}
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <StatCard
          title="Total Produk"
          value={stats?.products || 0}
          subtitle={`${stats?.low_stock_products || 0} stok rendah`}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatCard
          title="Revenue E-Commerce"
          value={stats?.revenue || 0}
          subtitle={`${stats?.orders || 0} pesanan`}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Revenue POS"
          value={stats?.pos_revenue || 0}
          subtitle={`${stats?.pos_transactions || 0} transaksi`}
          color="orange"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Grafik Pendapatan (30 Hari Terakhir)</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <EmptyState title="Belum ada data pendapatan" description="Data akan muncul setelah ada transaksi." />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) =>
                    new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                  }
                />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), '']}
                  labelFormatter={(label) => formatDate(label)}
                />
                <Legend />
                <Line type="monotone" dataKey="ecommerce" name="E-Commerce" stroke="#9333ea" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="pos" name="POS" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pesanan Terbaru</CardTitle>
            <Link href="/dashboard/orders" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              Lihat Semua
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <EmptyState title="Belum ada pesanan" />
            ) : (
              <div className="space-y-3">
                {recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{order.order_number}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-gray-900">{formatCurrency(order.total_amount)}</p>
                      <Badge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-red-600">Peringatan Stok Rendah</CardTitle>
            <Link href="/dashboard/products" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              Kelola Produk
            </Link>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <EmptyState title="Semua stok aman" description="Tidak ada produk dengan stok rendah." />
            ) : (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {product.stock_quantity} unit
                      </span>
                      {product.min_stock !== undefined && (
                        <p className="text-xs text-gray-400 mt-1">Min: {product.min_stock}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
