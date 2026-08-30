'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/services/admin';
import { cmsApi } from '@/lib/services/cms';
import { formatDateShort } from '@/lib/utils';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { PageForm } from '@/components/cms/PageForm';
import type { Page, Category } from '@/types';
import toast from 'react-hot-toast';

export default function CmsPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const response = await cmsApi.getPages({ per_page: 100 });
      const data = response.data.data.pages?.data || [];
      setPages(data);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal memuat halaman';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await adminApi.getCategories();
      setCategories(response.data.data.categories?.data || []);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  useEffect(() => {
    fetchPages();
    fetchCategories();
  }, []);

  const filtered = pages.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    setEditingPage(null);
    setFormOpen(true);
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus halaman ini?')) return;
    try {
      await cmsApi.deletePage(id);
      toast.success('Halaman berhasil dihapus');
      fetchPages();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menghapus halaman';
      toast.error(message);
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await cmsApi.publishPage(id);
      toast.success('Halaman dipublikasikan');
      fetchPages();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal mempublikasikan';
      toast.error(message);
    }
  };

  const handleUnpublish = async (id: number) => {
    try {
      await cmsApi.unpublishPage(id);
      toast.success('Halaman diarsipkan');
      fetchPages();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal mengarsipkan';
      toast.error(message);
    }
  };

  const handleFormSubmit = async (formData: Record<string, unknown>) => {
    setFormLoading(true);
    try {
      if (editingPage) {
        await cmsApi.updatePage(editingPage.id, formData);
        toast.success('Halaman diperbarui');
      } else {
        await cmsApi.createPage(formData);
        toast.success('Halaman dibuat');
      }
      setFormOpen(false);
      setEditingPage(null);
      fetchPages();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan halaman';
      toast.error(message);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Manajemen Halaman"
        description="Kelola halaman statis website."
        action={<Button variant="primary" onClick={handleCreate}>Tambah Halaman</Button>}
      />

      <Card className="mb-6">
        <CardContent className="p-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari halaman..."
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-purple-500"
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <EmptyState title="Halaman tidak ditemukan" description="Belum ada halaman yang cocok dengan pencarian." />
        ) : (
          filtered.map((page) => (
            <Card key={page.id}>
              <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold text-gray-900">{page.title}</h3>
                  <p className="text-sm text-gray-500">Slug: {page.slug}</p>
                  <p className="text-xs text-gray-400">{page.template || 'default'}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge status={page.status === 'published' ? 'active' : 'inactive'} />
                  {page.status === 'published' ? (
                    <Button variant="outline" size="sm" onClick={() => handleUnpublish(page.id)}>Unpublish</Button>
                  ) : (
                    <Button variant="primary" size="sm" onClick={() => handlePublish(page.id)}>Publish</Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleEdit(page)}>Edit</Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(page.id)}>Hapus</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <PageForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingPage(null); }}
        onSubmit={async (formData) => {
          setFormLoading(true);
          try {
            if (editingPage) {
              await cmsApi.updatePage(editingPage.id, formData);
              toast.success('Halaman diperbarui');
            } else {
              await cmsApi.createPage(formData);
              toast.success('Halaman dibuat');
            }
            setFormOpen(false);
            setEditingPage(null);
            fetchPages();
          } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan halaman';
            toast.error(message);
          } finally {
            setFormLoading(false);
          }
        }}
        categories={categories}
        initialData={editingPage}
        isLoading={formLoading}
      />
    </div>
  );
}