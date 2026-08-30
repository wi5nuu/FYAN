'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal';
import { Input, Select, Textarea, Checkbox } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import type { Category } from '@/types';

const categorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi'),
  slug: z.string().min(1, 'Slug wajib diisi').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
  description: z.string().optional(),
  type: z.enum(['ecommerce', 'pos', 'cms']).optional(),
  is_active: z.boolean().optional(),
  sort_order: z.coerce.number().int().min(0).optional(),
  parent_id: z.coerce.number().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
}).transform((data) => ({
  name: data.name,
  slug: data.slug,
  description: data.description ?? '',
  type: (data.type as 'ecommerce' | 'pos' | 'cms') ?? 'ecommerce',
  is_active: data.is_active ?? true,
  sort_order: data.sort_order ?? 0,
  parent_id: data.parent_id,
  meta_title: data.meta_title ?? '',
  meta_description: data.meta_description ?? '',
}));

export type CategoryFormData = z.output<typeof categorySchema>;

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  categories: Category[];
  initialData?: Category | null;
  isLoading?: boolean;
}

export function CategoryForm({
  isOpen,
  onClose,
  onSubmit,
  categories,
  initialData,
  isLoading,
}: CategoryFormProps) {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      type: 'ecommerce',
      is_active: true,
      sort_order: 0,
      parent_id: undefined,
      meta_title: '',
      meta_description: '',
    },
  });

  const name = watch('name');

  useEffect(() => {
    if (!isEdit && name && !watch('slug')) {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setValue('slug', slug, { shouldValidate: true });
    }
  }, [name, watch, setValue, isEdit]);

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description || '',
        type: (initialData.type as 'ecommerce' | 'pos' | 'cms') || 'ecommerce',
        is_active: initialData.is_active ?? true,
        sort_order: initialData.sort_order || 0,
        parent_id: initialData.parent_id,
        meta_title: '',
        meta_description: '',
      });
    } else {
      reset();
    }
  }, [initialData, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Kategori' : 'Tambah Kategori'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Nama Kategori *"
            error={errors.name?.message}
            {...register('name')}
            placeholder="Contoh: Elektronik"
          />
          <Input
            label="Slug *"
            error={errors.slug?.message}
            {...register('slug')}
            placeholder="contoh: elektronik"
          />
          <Input
            label="Tipe *"
            error={errors.type?.message}
            {...register('type')}
            disabled={isEdit}
          />
          <Select
            label="Kategori Induk"
            error={errors.parent_id?.message}
            {...register('parent_id')}
            options={[{ value: '', label: 'Tidak ada (Root)' }, ...categories.map(c => ({ value: String(c.id), label: c.name }))]}
            placeholder="Pilih kategori induk (opsional)"
          />
          <div className="md:col-span-2 flex items-center gap-4">
            <Checkbox label="Aktif" {...register('is_active')} />
          </div>
        </div>

        <Textarea
          label="Deskripsi"
          error={errors.description?.message}
          {...register('description')}
          rows={3}
          placeholder="Deskripsi kategori..."
        />

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