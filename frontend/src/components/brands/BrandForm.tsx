'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal';
import { Input, Textarea, Checkbox } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import type { Brand } from '@/types';

const brandSchema = z.object({
  name: z.string().min(1, 'Nama merek wajib diisi'),
  slug: z.string().min(1, 'Slug wajib diisi').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
}).transform((data) => ({
  name: data.name,
  slug: data.slug,
  description: data.description ?? '',
  is_active: data.is_active ?? true,
}));

export type BrandFormData = z.output<typeof brandSchema>;

interface BrandFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BrandFormData) => Promise<void>;
  initialData?: Brand | null;
  isLoading?: boolean;
}

export function BrandForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: BrandFormProps) {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      is_active: true,
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
        is_active: initialData.is_active ?? true,
      });
    } else {
      reset();
    }
  }, [initialData, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Merek' : 'Tambah Merek'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Nama Merek *"
            error={errors.name?.message}
            {...register('name')}
            placeholder="Contoh: Samsung"
          />
          <Input
            label="Slug *"
            error={errors.slug?.message}
            {...register('slug')}
            placeholder="contoh: samsung"
          />
        </div>

        <Textarea
          label="Deskripsi"
          error={errors.description?.message}
          {...register('description')}
          rows={3}
          placeholder="Deskripsi merek..."
        />

        <div className="flex items-center gap-4">
          <Checkbox label="Aktif" {...register('is_active')} />
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