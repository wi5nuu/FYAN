'use client';

import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/services/admin';
import { formatCurrency } from '@/lib/utils';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/shared/empty-state';
import type { Product } from '@/types';

export default function DashboardProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getProducts({ per_page: 100 })
      .then((response) => setProducts(response.data.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;

    return products.filter((product) =>
      [product.name, product.sku, product.category?.name].some((value) =>
        value?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [products, search]);

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Manajemen Produk"
        description="Kelola katalog produk, stok, dan harga secara terpusat."
        action={
          <Button variant="primary">Tambah Produk</Button>
        }
      />

      <Card className="mb-6">
        <CardContent className="p-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk, SKU, atau kategori..."
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-purple-500"
          />
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredProducts.length === 0 ? <EmptyState title="Produk tidak ditemukan" description="Belum ada produk yang cocok dengan pencarian." /> : filteredProducts.map((product) => (
          <Card key={product.id}>
            <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-xl bg-gray-100">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xl text-purple-300">◈</div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                  <p className="text-sm text-gray-500">Kategori: {product.category?.name || 'Umum'}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="text-left sm:text-right">
                  <p className="text-lg font-bold text-purple-700">{formatCurrency(product.discount_price ?? product.price)}</p>
                  <p className="text-xs text-gray-500">Stok: {product.stock_quantity}</p>
                </div>
                <Badge status={product.is_active ? 'active' : 'inactive'} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
