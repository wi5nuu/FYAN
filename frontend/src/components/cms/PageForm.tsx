'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal';
import { Input, Select, Textarea, Checkbox } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import type { Category } from '@/types';

const pageSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  slug: z.string().min(1, 'Slug wajib diisi').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
  content: z.string().min(1, 'Konten wajib diisi'),
  excerpt: z.string().optional(),
  featured_image: z.string().optional(),
  template: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_homepage: z.boolean().default(false),
}).transform((data) => ({
  title: data.title,
  slug: data.slug,
  content: data.content,
  excerpt: data.excerpt ?? '',
  featured_image: data.featured_image ?? '',
  template: data.template ?? 'default',
  meta_title: data.meta_title ?? '',
  meta_description: data.meta_description ?? '',
  meta_keywords: data.meta_keywords ?? '',
  sort_order: data.sort_order ?? 0,
  is_homepage: data.is_homepage ?? false,
}));

export type PageFormData = z.output<typeof pageSchema>;

interface PageFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PageFormData) => Promise<void>;
  categories: Category[];
  initialData?: { id: number; title: string; slug: string; content: string; excerpt?: string; featured_image?: string; template?: string; meta_title?: string; meta_description?: string; meta_keywords?: string; sort_order?: number; is_homepage?: boolean; status?: string } | null;
  isLoading?: boolean;
}

export function PageForm({
  isOpen,
  onClose,
  onSubmit,
  categories,
  initialData,
  isLoading,
}: PageFormProps) {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PageFormData>({
    resolver: zodResolver(pageSchema) as any,
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      featured_image: '',
      template: 'default',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      sort_order: 0,
      is_homepage: false,
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
        template: initialData.template || 'default',
        meta_title: initialData.meta_title || '',
        meta_description: initialData.meta_description || '',
        meta_keywords: initialData.meta_keywords || '',
        sort_order: initialData.sort_order || 0,
        is_homepage: initialData.is_homepage || false,
      });
    } else {
      reset();
    }
  }, [initialData, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Halaman' : 'Tambah Halaman'} size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Judul Halaman *"
            error={errors.title?.message}
            {...register('title')}
            placeholder="Contoh: Tentang Kami"
          />
          <Input
            label="Slug *"
            error={errors.slug?.message}
            {...register('slug')}
            placeholder="contoh: tentang-kami"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Template"
            error={errors.template?.message}
            {...register('template')}
            placeholder="default"
          />
        </div>

        <Textarea
          label="Konten *"
          error={errors.content?.message}
          {...register('content')}
          rows={15}
          placeholder="Konten halaman (HTML didukung)..."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Textarea
            label="Ringkasan (Excerpt)"
            error={errors.excerpt?.message}
            {...register('excerpt')}
            rows={3}
            placeholder="Ringkasan singkat untuk SEO..."
          />
          <Input
            label="Featured Image URL"
            error={errors.featured_image?.message}
            {...register('featured_image')}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
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
            placeholder="kata kunci, seo, halaman"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Urutan (Sort Order)"
            type="number"
            error={errors.sort_order?.message}
            {...register('sort_order')}
            placeholder="0"
          />
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              {...register('is_homepage')}
              className="h-4 w-4 rounded border-gray-200 text-purple-600 focus:ring-purple-500"
            />
            <label className="text-sm text-gray-700 cursor-pointer">Jadikan Halaman Utama</label>
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