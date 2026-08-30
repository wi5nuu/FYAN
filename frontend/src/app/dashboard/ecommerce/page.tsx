'use client';

import { useEffect, useState } from 'react';
import { ecommerceApi } from '@/lib/services/ecommerce';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { PageLoader } from '@/components/ui/spinner';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

export default function DashboardEcommercePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ecommerceApi.getProducts({ per_page: 100 })
      .then((response) => setProducts(response.data.data.data || []))
      .catch((error) => toast.error(error?.response?.data?.message || 'Gagal memuat produk'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="E-Commerce Dashboard"
        description="Ringkasan dan akses cepat ke manajemen e-commerce"
      />

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Total Produk</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{products.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Produk Aktif</p>
            <p className="mt-2 text-3xl font-bold text-green-600">{products.filter(p => p.is_active).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Stok Rendah</p>
            <p className="mt-2 text-3xl font-bold text-orange-600">
              {products.filter(p => p.stock_quantity <= (p.min_stock ?? 5)).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Produk Terbaru</h3>
          {products.length === 0 ? (
            <EmptyState title="Belum ada produk" description="Tambahkan produk pertama Anda untuk memulai." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {products.slice(0, 8).map((product) => (
                <div key={product.id} className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow">
                  <div className="h-32 w-full overflow-hidden rounded-lg bg-gray-100 mb-3">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl text-purple-300">◈</div>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                  <p className="mt-2 text-lg font-bold text-purple-700">{formatCurrency(product.discount_price ?? product.price)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}