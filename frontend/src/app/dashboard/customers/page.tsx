'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/services/admin';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { CustomerForm } from '@/components/customers/CustomerForm';
import type { Customer } from '@/types';
import toast from 'react-hot-toast';

export default function DashboardCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getCustomers({ per_page: 100 });
      setCustomers(response.data.data.data || []);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal memuat pelanggan';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const handleCreate = () => {
    setEditingCustomer(null);
    setFormOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus pelanggan ini?')) return;
    try {
      await adminApi.deleteCustomer(id);
      toast.success('Pelanggan berhasil dihapus');
      fetchCustomers();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menghapus pelanggan';
      toast.error(message);
    }
  };

  const handleFormSubmit = async (formData: Record<string, unknown>) => {
    setFormLoading(true);
    try {
      if (editingCustomer) {
        await adminApi.updateCustomer(editingCustomer.id, formData);
        toast.success('Pelanggan berhasil diperbarui');
      } else {
        await adminApi.createCustomer(formData);
        toast.success('Pelanggan berhasil dibuat');
      }
      setFormOpen(false);
      setEditingCustomer(null);
      fetchCustomers();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan pelanggan';
      toast.error(message);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Manajemen Pelanggan"
        description="Kelola data pelanggan untuk penjualan dan CRM."
        action={<Button variant="primary" onClick={handleCreate}>Tambah Pelanggan</Button>}
      />

      <Card className="mb-6">
        <CardContent className="p-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pelanggan..."
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-purple-500"
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <EmptyState title="Pelanggan tidak ditemukan" description="Belum ada pelanggan yang cocok dengan pencarian." />
        ) : (
          filtered.map((customer) => (
            <Card key={customer.id}>
              <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                  {customer.email && <p className="text-sm text-gray-500">Email: {customer.email}</p>}
                  {customer.phone && <p className="text-sm text-gray-500">Telp: {customer.phone}</p>}
                  {customer.city && <p className="text-xs text-gray-400">{customer.city}, {customer.province}</p>}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge status={customer.is_active ? 'active' : 'inactive'} />
                  <Button variant="outline" size="sm" onClick={() => handleEdit(customer)}>Edit</Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(customer.id)}>Hapus</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CustomerForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingCustomer(null); }}
        onSubmit={async (formData) => {
          setFormLoading(true);
          try {
            if (editingCustomer) {
              await adminApi.updateCustomer(editingCustomer.id, formData);
              toast.success('Pelanggan berhasil diperbarui');
            } else {
              await adminApi.createCustomer(formData);
              toast.success('Pelanggan berhasil dibuat');
            }
            setFormOpen(false);
            setEditingCustomer(null);
            fetchCustomers();
          } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan pelanggan';
            toast.error(message);
          } finally {
            setFormLoading(false);
          }
        }}
        initialData={editingCustomer}
        isLoading={formLoading}
      />
    </div>
  );
}