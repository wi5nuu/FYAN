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
import { PostForm } from '@/components/cms/PostForm';
import type { Post, Category } from '@/types';
import toast from 'react-hot-toast';

interface Tag {
  name: string;
  slug: string;
}

export default function CmsPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { per_page: 100 };
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await cmsApi.getPosts(params);
      const data = response.data.data.posts?.data || response.data.data.data || [];
      setPosts(data);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal memuat artikel';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        adminApi.getCategories(),
        cmsApi.getPosts({ per_page: 500 }),
      ]);
      setCategories(catRes.data.data.categories || catRes.data.data.data || []);
      // Extract unique tags from posts
      const allTags = new Set<string>();
      (tagRes.data.data.posts?.data || []).forEach((post: Post) => {
        post.tags?.forEach((tag: Tag) => allTags.add(tag.name));
      });
      setTags(Array.from(allTags).map(name => ({ name, slug: name.toLowerCase().replace(/\s+/g, '-') })));
    } catch (error) {
      console.error('Failed to fetch dropdown data', error);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchDropdownData();
  }, [statusFilter]);

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase()) ||
    p.tags?.some((tag: Tag) => tag.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreate = () => {
    setEditingPost(null);
    setFormOpen(true);
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus artikel ini?')) return;
    try {
      await cmsApi.deletePost(id);
      toast.success('Artikel dihapus');
      fetchPosts();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menghapus';
      toast.error(message);
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await cmsApi.publishPost(id);
      toast.success('Artikel dipublikasikan');
      fetchPosts();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal mempublikasikan';
      toast.error(message);
    }
  };

  const handleUnpublish = async (id: number) => {
    try {
      await cmsApi.unpublishPost(id);
      toast.success('Artikel diarsipkan');
      fetchPosts();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal mengarsipkan';
      toast.error(message);
    }
  };

  const handleFormSubmit = async (formData: Record<string, unknown>) => {
    setFormLoading(true);
    try {
      if (editingPost) {
        await cmsApi.updatePost(editingPost.id, formData);
        toast.success('Artikel diperbarui');
      } else {
        await cmsApi.createPost(formData);
        toast.success('Artikel dibuat');
      }
      setFormOpen(false);
      setEditingPost(null);
      fetchPosts();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan artikel';
      toast.error(message);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Manajemen Artikel"
        description="Kelola artikel blog dan berita website."
        action={<Button variant="primary" onClick={handleCreate}>Tambah Artikel</Button>}
      />

      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex-1 min-w-[250px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari artikel..."
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-purple-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-purple-500"
        >
          <option value="all">Semua Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <EmptyState title="Artikel tidak ditemukan" description="Belum ada artikel yang cocok dengan pencarian." />
        ) : (
          filtered.map((post) => (
            <Card key={post.id}>
              <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                  <p className="text-sm text-gray-500">Slug: {post.slug}</p>
                  <p className="text-xs text-gray-400">
                    Kategori: {post.category?.name || '—'} | Views: {post.views_count || 0}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {post.tags?.map((tag: Tag) => (
                      <span key={tag.name} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {post.status}
                  </span>
                  {post.is_featured && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Featured
                    </span>
                  )}
                  {post.status === 'published' ? (
                    <Button variant="outline" size="sm" onClick={() => handleUnpublish(post.id)}>Unpublish</Button>
                  ) : (
                    <Button variant="primary" size="sm" onClick={() => handlePublish(post.id)}>Publish</Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>Edit</Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(post.id)}>Hapus</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <PostForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingPost(null); }}
        onSubmit={async (formData) => {
          setFormLoading(true);
          try {
            if (editingPost) {
              await cmsApi.updatePost(editingPost.id, formData);
              toast.success('Artikel diperbarui');
            } else {
              await cmsApi.createPost(formData);
              toast.success('Artikel dibuat');
            }
            setFormOpen(false);
            setEditingPost(null);
            fetchPosts();
          } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan artikel';
            toast.error(message);
          } finally {
            setFormLoading(false);
          }
        }}
        categories={categories}
        tags={tags.map(t => t.name)}
        initialData={editingPost}
        isLoading={formLoading}
      />
    </div>
  );
}