'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ProductCard } from '@/components/ecommerce/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/spinner';
import { ecommerceApi } from '@/lib/services/ecommerce';
import { demoProducts } from '@/lib/mock-data';
import type { PaginatedResponse, Product } from '@/types';
import toast from 'react-hot-toast';

export default function EcommerceCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Omit<PaginatedResponse<Product>, 'data'> | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string | number> = { page, per_page: 12 };
      if (search) params.search = search;

      const response = await ecommerceApi.getProducts(params);
      const paginated = response.data.data as unknown as PaginatedResponse<Product>;

      setProducts(paginated.data);
      setPagination({
        current_page: paginated.current_page,
        last_page: paginated.last_page,
        per_page: paginated.per_page,
        total: paginated.total,
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Gagal memuat produk';

      const fallbackProducts = demoProducts.filter((product) => {
        if (!search) return true;
        return [product.name, product.sku, product.category?.name, product.short_description]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(search.toLowerCase()));
      });

      setProducts(fallbackProducts);
      setPagination({
        current_page: 1,
        last_page: 1,
        per_page: 12,
        total: fallbackProducts.length,
      });
      setError(null);
      toast.error(`${message}. Menampilkan data demo.`);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  return (
    <div>
      <PageHeader
        title="Katalog Produk"
        description="Temukan produk terbaik untuk kebutuhan bisnis dan personal Anda"
      />

      <form onSubmit={handleSearch} className="mb-8 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Cari produk berdasarkan nama, deskripsi, atau SKU..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit">Cari</Button>
          {search && (
            <Button type="button" variant="outline" onClick={handleClearSearch}>
              Reset
            </Button>
          )}
        </div>
      </form>

      {search && pagination && (
        <p className="mb-4 text-sm text-gray-500">
          Menampilkan hasil pencarian "{search}" — {pagination.total} produk ditemukan
        </p>
      )}

      {loading ? (
        <PageLoader />
      ) : error ? (
        <EmptyState
          title="Terjadi Kesalahan"
          description={error}
          action={
            <Button onClick={fetchProducts} variant="primary">
              Coba Lagi
            </Button>
          }
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="Produk Tidak Ditemukan"
          description={search ? 'Coba kata kunci pencarian yang berbeda.' : 'Belum ada produk tersedia saat ini.'}
          action={
            search ? (
              <Button onClick={handleClearSearch} variant="outline">
                Lihat Semua Produk
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {pagination && pagination.last_page > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-gray-600">
                Halaman {pagination.current_page} dari {pagination.last_page}
              </span>
              <Button
                variant="outline"
                disabled={page >= pagination.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}