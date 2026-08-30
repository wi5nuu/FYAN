'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal';
import { Input, Select, Textarea, Checkbox } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import type { Category } from '@/types';

const postSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  slug: z.string().min(1, 'Slug wajib diisi').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
  content: z.string().min(1, 'Konten wajib diisi'),
  excerpt: z.string().optional(),
  featured_image: z.string().optional(),
  category_id: z.coerce.number().min(1, 'Kategori wajib dipilih'),
  tags: z.array(z.string()).optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  is_featured: z.boolean().default(false),
}).transform((data) => ({
  title: data.title,
  slug: data.slug,
  content: data.content,
  excerpt: data.excerpt ?? '',
  featured_image: data.featured_image ?? '',
  category_id: data.category_id!,
  tags: data.tags ?? [],
  meta_title: data.meta_title ?? '',
  meta_description: data.meta_description ?? '',
  meta_keywords: data.meta_keywords ?? '',
  is_featured: data.is_featured ?? false,
}));

export type PostFormData = z.output<typeof postSchema>;

interface PostFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PostFormData) => Promise<void>;
  categories: Category[];
  tags: string[];
  initialData?: { id: number; title: string; slug: string; content: string; excerpt?: string; featured_image?: string; category_id?: number; tags?: Tag[]; meta_title?: string; meta_description?: string; meta_keywords?: string; is_featured?: boolean; status?: string } | null;
  isLoading?: boolean;
}

export function PostForm({
  isOpen,
  onClose,
  onSubmit,
  categories,
  tags,
  initialData,
  isLoading,
}: PostFormProps) {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema) as any,
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      featured_image: '',
      category_id: undefined,
      tags: [],
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      is_featured: false,
    },
  });

  const title = watch('title');

  useEffect(() => {
    if (!isEdit && title && !watch('slug')) {
      const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setValue('slug', slug, { shouldValidate: true });
    }
  }, [title, watch, setValue, isEdit]);

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        slug: initialData.slug,
        content: initialData.content,
        excerpt: initialData.excerpt || '',
        featured_image: initialData.featured_image || '',
        category_id: initialData.category_id,
        tags: initialData.tags?.map((t: Tag) => t.name) || [],
        meta_title: initialData.meta_title || '',
        meta_description: initialData.meta_description || '',
        meta_keywords: initialData.meta_keywords || '',
        is_featured: initialData.is_featured || false,
      });
    } else {
      reset();
    }
  }, [initialData, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Artikel' : 'Tambah Artikel'} size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Judul Artikel *"
            error={errors.title?.message}
            {...register('title')}
            placeholder="Contoh: Tips Memilih Produk Terbaik"
          />
          <Input
            label="Slug *"
            error={errors.slug?.message}
            {...register('slug')}
            placeholder="contoh: tips-memilih-produk-terbaik"
          />
        </div>

        <Select
          label="Kategori *"
          error={errors.category_id?.message}
          {...register('category_id')}
          options={categories.map(c => ({ value: String(c.id), label: c.name }))}
          placeholder="Pilih kategori"
        />

        <Textarea
          label="Konten *"
          error={errors.content?.message}
          {...register('content')}
          rows={20}
          placeholder="Konten artikel (HTML didukung)..."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Textarea
            label="Ringkasan (Excerpt)"
            error={errors.excerpt?.message}
            {...register('excerpt')}
            rows={3}
            placeholder="Ringkasan singkat untuk preview..."
          />
          <Input
            label="Featured Image URL"
            error={errors.featured_image?.message}
            {...register('featured_image')}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Meta Title"
            error={errors.meta_title?.message}
            {...register('meta_title')}
            placeholder="Judul SEO..."
          />
          <Input
            label="Meta Description"
            error={errors.meta_description?.message}
            {...register('meta_description')}
            placeholder="Deskripsi SEO..."
          />
          <Input
            label="Meta Keywords"
            error={errors.meta_keywords?.message}
            {...register('meta_keywords')}
            placeholder="kata kunci, artikel, blog"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string) => (
                <label key={tag} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    value={tag}
                    {...register('tags')}
                    className="h-4 w-4 rounded border-gray-200 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{tag}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              {...register('is_featured')}
              className="h-4 w-4 rounded border-gray-200 text-purple-600 focus:ring-purple-500"
            />
            <label className="text-sm text-gray-700 cursor-pointer">Jadikan Artikel Unggulan</label>
          </div>
        </div>

        <div className="border-t pt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : isEdit ? 'Update' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}