'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/services/admin';
import { formatCurrency } from '@/lib/utils';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { CategoryForm } from '@/components/categories/CategoryForm';
import type { Category } from '@/types';
import toast from 'react-hot-toast';

export default function DashboardCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getCategories();
      setCategories(response.data.data.categories?.data || []);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal memuat kategori';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    cat.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    setEditingCategory(null);
    setFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus kategori ini?')) return;
    try {
      await adminApi.deleteCategory(id);
      toast.success('Kategori berhasil dihapus');
      fetchCategories();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menghapus kategori';
      toast.error(message);
    }
  };

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    setFormLoading(true);
    try {
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, data);
        toast.success('Kategori berhasil diperbarui');
      } else {
        await adminApi.createCategory(data);
        toast.success('Kategori berhasil dibuat');
      }
      setFormOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan kategori';
      toast.error(message);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Manajemen Kategori"
        description="Kelola kategori produk untuk e-commerce, POS, dan CMS."
        action={<Button variant="primary" onClick={handleCreate}>Tambah Kategori</Button>}
      />

      <Card className="mb-6">
        <CardContent className="p-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kategori..."
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-purple-500"
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredCategories.length === 0 ? (
          <EmptyState title="Kategori tidak ditemukan" description="Belum ada kategori yang cocok dengan pencarian." />
        ) : (
          filteredCategories.map((category) => (
            <Card key={category.id}>
              <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">Slug: {category.slug}</p>
                    <p className="text-xs text-gray-400">Tipe: {category.type}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge status={category.is_active ? 'active' : 'inactive'} />
                  <span className="text-sm text-gray-500">Urutan: {category.sort_order}</span>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>Edit</Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(category.id)}>Hapus</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CategoryForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingCategory(null); }}
        onSubmit={handleFormSubmit}
        categories={categories}
        initialData={editingCategory}
        isLoading={formLoading}
      />
    </div>
  );
}