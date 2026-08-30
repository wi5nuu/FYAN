'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/services/admin';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { SupplierForm } from '@/components/suppliers/SupplierForm';
import type { Supplier } from '@/types';
import toast from 'react-hot-toast';

export default function DashboardSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getSuppliers();
      setSuppliers(response.data.data.data || []);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal memuat supplier';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.slug.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    setEditingSupplier(null);
    setFormOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus supplier ini?')) return;
    try {
      await adminApi.deleteSupplier(id);
      toast.success('Supplier berhasil dihapus');
      fetchSuppliers();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menghapus supplier';
      toast.error(message);
    }
  };

  const handleFormSubmit = async (formData: Record<string, unknown>) => {
    setFormLoading(true);
    try {
      if (editingSupplier) {
        await adminApi.updateSupplier(editingSupplier.id, formData);
        toast.success('Supplier berhasil diperbarui');
      } else {
        await adminApi.createSupplier(formData);
        toast.success('Supplier berhasil dibuat');
      }
      setFormOpen(false);
      setEditingSupplier(null);
      fetchSuppliers();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan supplier';
      toast.error(message);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Manajemen Supplier"
        description="Kelola data supplier untuk pengadaan barang."
        action={<Button variant="primary" onClick={handleCreate}>Tambah Supplier</Button>}
      />

      <Card className="mb-6">
        <CardContent className="p-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari supplier..."
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-purple-500"
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <EmptyState title="Supplier tidak ditemukan" description="Belum ada supplier yang cocok dengan pencarian." />
        ) : (
          filtered.map((supplier) => (
            <Card key={supplier.id}>
              <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                  <p className="text-sm text-gray-500">Slug: {supplier.slug}</p>
                  {supplier.email && <p className="text-xs text-gray-400">Email: {supplier.email}</p>}
                  {supplier.phone && <p className="text-xs text-gray-400">Telp: {supplier.phone}</p>}
                  {supplier.city && <p className="text-xs text-gray-400">{supplier.city}, {supplier.province}</p>}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge status={supplier.is_active ? 'active' : 'inactive'} />
                  <Button variant="outline" size="sm" onClick={() => handleEdit(supplier)}>Edit</Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(supplier.id)}>Hapus</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <SupplierForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingSupplier(null); }}
        onSubmit={handleFormSubmit}
        initialData={editingSupplier}
        isLoading={formLoading}
      />
    </div>
  );
}