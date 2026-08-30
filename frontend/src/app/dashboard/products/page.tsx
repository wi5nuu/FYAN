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
import { ProductForm } from '@/components/products/ProductForm';
import type { Product, Category, Brand, Supplier } from '@/types';
import toast from 'react-hot-toast';

export default function DashboardProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getProducts({ per_page: 100 });
      setProducts(response.data.data.data || []);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal memuat produk';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [catRes, brandRes, supRes] = await Promise.all([
        adminApi.getCategories(),
        adminApi.getBrands(),
        adminApi.getSuppliers(),
      ]);
      setCategories(catRes.data.data.data || []);
      setBrands(brandRes.data.data.data || []);
      setSuppliers(supRes.data.data.data || []);
    } catch (error) {
      console.error('Failed to fetch dropdown data', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchDropdownData();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    return products.filter((product) =>
      [product.name, product.sku, product.category?.name].some((value) =>
        value?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [products, search]);

  const handleCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      await adminApi.deleteProduct(id);
      toast.success('Produk berhasil dihapus');
      fetchProducts();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menghapus produk';
      toast.error(message);
    }
  };

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    setFormLoading(true);
    try {
      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, data);
        toast.success('Produk berhasil diperbarui');
      } else {
        await adminApi.createProduct(data);
        toast.success('Produk berhasil dibuat');
      }
      setFormOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan produk';
      toast.error(message);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Manajemen Produk"
        description="Kelola katalog produk, stok, dan harga secara terpusat."
        action={<Button variant="primary" onClick={handleCreate}>Tambah Produk</Button>}
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
        {filteredProducts.length === 0 ? (
          <EmptyState title="Produk tidak ditemukan" description="Belum ada produk yang cocok dengan pencarian." />
        ) : (
          filteredProducts.map((product) => (
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
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>Edit</Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(product.id)}>Hapus</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ProductForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingProduct(null); }}
        onSubmit={handleFormSubmit}
        categories={categories}
        brands={brands}
        suppliers={suppliers}
        initialData={editingProduct}
        isLoading={formLoading}
      />
    </div>
  );
}