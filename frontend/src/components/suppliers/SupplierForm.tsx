'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal';
import { Input, Textarea, Checkbox } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import type { Supplier } from '@/types';

const supplierSchema = z.object({
  name: z.string().min(1, 'Nama supplier wajib diisi'),
  slug: z.string().min(1, 'Slug wajib diisi').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
  email: z.string().email('Format email tidak valid').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postal_code: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.boolean().optional(),
}).transform((data) => ({
  name: data.name,
  slug: data.slug,
  email: data.email ?? '',
  phone: data.phone ?? '',
  address: data.address ?? '',
  city: data.city ?? '',
  province: data.province ?? '',
  postal_code: data.postal_code ?? '',
  notes: data.notes ?? '',
  is_active: data.is_active ?? true,
}));

export type SupplierFormData = z.output<typeof supplierSchema>;

interface SupplierFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierFormData) => Promise<void>;
  initialData?: Supplier | null;
  isLoading?: boolean;
}

export function SupplierForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: SupplierFormProps) {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      province: '',
      postal_code: '',
      notes: '',
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
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        city: initialData.city || '',
        province: initialData.province || '',
        postal_code: initialData.postal_code || '',
        notes: initialData.notes || '',
        is_active: initialData.is_active ?? true,
      });
    } else {
      reset();
    }
  }, [initialData, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Supplier' : 'Tambah Supplier'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Nama Supplier *"
            error={errors.name?.message}
            {...register('name')}
            placeholder="Contoh: PT Tech Indonesia"
          />
          <Input
            label="Slug *"
            error={errors.slug?.message}
            {...register('slug')}
            placeholder="contoh: pt-tech-indonesia"
          />
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register('email')}
            placeholder="info@techindonesia.com"
          />
          <Input
            label="Telepon"
            error={errors.phone?.message}
            {...register('phone')}
            placeholder="021-1234567"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Kota"
            error={errors.city?.message}
            {...register('city')}
            placeholder="Jakarta"
          />
          <Input
            label="Provinsi"
            error={errors.province?.message}
            {...register('province')}
            placeholder="DKI Jakarta"
          />
          <Input
            label="Kode Pos"
            error={errors.postal_code?.message}
            {...register('postal_code')}
            placeholder="12345"
          />
        </div>

        <Input
          label="Alamat Lengkap"
          error={errors.address?.message}
          {...register('address')}
          placeholder="Jl. Teknologi No. 1"
        />

        <Textarea
          label="Catatan"
          error={errors.notes?.message}
          {...register('notes')}
          rows={3}
          placeholder="Catatan tambahan..."
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