'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/services/admin';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { BrandForm } from '@/components/brands/BrandForm';
import type { Brand } from '@/types';
import toast from 'react-hot-toast';

export default function DashboardBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getBrands();
      setBrands(response.data.data.data || []);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal memuat merek';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(search.toLowerCase()) ||
    brand.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    setEditingBrand(null);
    setFormOpen(true);
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus merek ini?')) return;
    try {
      await adminApi.deleteBrand(id);
      toast.success('Merek berhasil dihapus');
      fetchBrands();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menghapus merek';
      toast.error(message);
    }
  };

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    setFormLoading(true);
    try {
      if (editingBrand) {
        await adminApi.updateBrand(editingBrand.id, data);
        toast.success('Merek berhasil diperbarui');
      } else {
        await adminApi.createBrand(data);
        toast.success('Merek berhasil dibuat');
      }
      setFormOpen(false);
      setEditingBrand(null);
      fetchBrands();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan merek';
      toast.error(message);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Manajemen Merek"
        description="Kelola merek produk untuk katalog."
        action={<Button variant="primary" onClick={handleCreate}>Tambah Merek</Button>}
      />

      <Card className="mb-6">
        <CardContent className="p-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari merek..."
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-purple-500"
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <EmptyState title="Merek tidak ditemukan" description="Belum ada merek yang cocok dengan pencarian." />
        ) : (
          filtered.map((brand) => (
            <Card key={brand.id}>
              <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{brand.name}</h3>
                    <p className="text-sm text-gray-500">Slug: {brand.slug}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge status={brand.is_active ? 'active' : 'inactive'} />
                  <Button variant="outline" size="sm" onClick={() => handleEdit(brand)}>Edit</Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(brand.id)}>Hapus</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <BrandForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingBrand(null); }}
        onSubmit={async (formData) => {
          setFormLoading(true);
          try {
            if (editingBrand) {
              await adminApi.updateBrand(editingBrand.id, formData);
              toast.success('Merek berhasil diperbarui');
            } else {
              await adminApi.createBrand(formData);
              toast.success('Merek berhasil dibuat');
            }
            setFormOpen(false);
            setEditingBrand(null);
            fetchBrands();
          } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan merek';
            toast.error(message);
          } finally {
            setFormLoading(false);
          }
        }}
        initialData={editingBrand}
        isLoading={formLoading}
      />
    </div>
  );
}