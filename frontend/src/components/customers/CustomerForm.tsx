'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal';
import { Input, Textarea, Checkbox } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import type { Customer } from '@/types';

const customerSchema = z.object({
  name: z.string().min(1, 'Nama pelanggan wajib diisi'),
  email: z.string().email('Format email tidak valid').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postal_code: z.string().optional(),
  is_active: z.boolean().optional(),
}).transform((data) => ({
  name: data.name,
  email: data.email ?? '',
  phone: data.phone ?? '',
  address: data.address ?? '',
  city: data.city ?? '',
  province: data.province ?? '',
  postal_code: data.postal_code ?? '',
  is_active: data.is_active ?? true,
}));

export type CustomerFormData = z.output<typeof customerSchema>;

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  initialData?: Customer | null;
  isLoading?: boolean;
}

export function CustomerForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: CustomerFormProps) {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      province: '',
      postal_code: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        city: initialData.city || '',
        province: initialData.province || '',
        postal_code: initialData.postal_code || '',
        is_active: initialData.is_active ?? true,
      });
    } else {
      reset();
    }
  }, [initialData, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Pelanggan' : 'Tambah Pelanggan'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Nama Pelanggan *"
            error={errors.name?.message}
            {...register('name')}
            placeholder="Contoh: Budi Santoso"
          />
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register('email')}
            placeholder="budi@example.com"
          />
          <Input
            label="Telepon"
            error={errors.phone?.message}
            {...register('phone')}
            placeholder="08123456789"
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
          placeholder="Jl. Sudirman No. 123"
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