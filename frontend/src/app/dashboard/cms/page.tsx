'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { PageLoader } from '@/components/ui/spinner';
import { cmsApi } from '@/lib/services/cms';
import { formatDateShort } from '@/lib/utils';
import type { Page, Post } from '@/types';

export default function CmsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([cmsApi.getPosts(), cmsApi.getPages()])
      .then(([postsResponse, pagesResponse]) => {
        setPosts(postsResponse.data.data.posts?.data || []);
        setPages(pagesResponse.data.data.pages?.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="Content Management System" description="Kelola halaman dan artikel yang tampil di website." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4 font-semibold text-gray-900">Artikel</div>
          {posts.length === 0 ? <EmptyState title="Belum ada artikel" /> : <div className="divide-y divide-gray-100">{posts.slice(0, 8).map((post) => <div key={post.id} className="px-5 py-4"><p className="font-medium text-gray-900">{post.title}</p><p className="mt-1 text-sm text-gray-500">{post.status} · {formatDateShort(post.created_at)}</p></div>)}</div>}
        </section>
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4 font-semibold text-gray-900">Halaman</div>
          {pages.length === 0 ? <EmptyState title="Belum ada halaman" /> : <div className="divide-y divide-gray-100">{pages.slice(0, 8).map((page) => <div key={page.id} className="px-5 py-4"><p className="font-medium text-gray-900">{page.title}</p><p className="mt-1 text-sm text-gray-500">{page.status} · {formatDateShort(page.created_at)}</p></div>)}</div>}
        </section>
      </div>
    </div>
  );
}
