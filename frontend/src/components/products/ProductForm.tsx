'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal';
import { Input, Select, Textarea, Checkbox } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import type { Category, Brand, Supplier, Product } from '@/types';

const productSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi'),
  sku: z.string().min(1, 'SKU wajib diisi'),
  barcode: z.string().optional(),
  description: z.string().optional(),
  short_description: z.string().optional(),
  price: z.coerce.number().min(0, 'Harga minimal 0'),
  cost_price: z.coerce.number().min(0).optional(),
  discount_price: z.coerce.number().min(0).optional(),
  stock_quantity: z.coerce.number().int().min(0).default(0),
  min_stock: z.coerce.number().int().min(0).default(5),
  category_id: z.coerce.number().min(1, 'Kategori wajib dipilih'),
  brand_id: z.coerce.number().optional(),
  supplier_id: z.coerce.number().optional(),
  type: z.enum(['ecommerce', 'pos']),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  tax_rate: z.coerce.number().min(0).max(100).default(11),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  categories: Category[];
  brands: Brand[];
  suppliers: Supplier[];
  initialData?: Product | null;
  isLoading?: boolean;
}

export function ProductForm({
  isOpen,
  onClose,
  onSubmit,
  categories,
  brands,
  suppliers,
  initialData,
  isLoading,
}: ProductFormProps) {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      barcode: '',
      description: '',
      short_description: '',
      price: 0,
      cost_price: 0,
      discount_price: 0,
      stock_quantity: 0,
      min_stock: 5,
      category_id: undefined,
      brand_id: undefined,
      supplier_id: undefined,
      type: 'ecommerce',
      is_active: true,
      is_featured: false,
      tax_rate: 11,
      meta_title: '',
      meta_description: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        sku: initialData.sku,
        barcode: initialData.barcode || '',
        description: initialData.description || '',
        short_description: initialData.short_description || '',
        price: initialData.price,
        cost_price: initialData.cost_price || 0,
        discount_price: initialData.discount_price || 0,
        stock_quantity: initialData.stock_quantity,
        min_stock: initialData.min_stock || 5,
        category_id: initialData.category_id,
        brand_id: initialData.brand_id,
        supplier_id: initialData.supplier_id,
        type: initialData.type || 'ecommerce',
        is_active: initialData.is_active ?? true,
        is_featured: initialData.is_featured ?? false,
        tax_rate: 11,
        meta_title: '',
        meta_description: '',
      });
    } else {
      reset();
    }
  }, [initialData, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Produk' : 'Tambah Produk'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Nama Produk *"
            error={errors.name?.message}
            {...register('name')}
            placeholder="Contoh: Samsung Galaxy S24"
          />
          <Input
            label="SKU *"
            error={errors.sku?.message}
            {...register('sku')}
            placeholder="Contoh: SAM-GALAXY-S24"
          />
          <Input
            label="Barcode"
            error={errors.barcode?.message}
            {...register('barcode')}
            placeholder="Opsional"
          />
          <Input
            label="Harga Jual *"
            type="number"
            error={errors.price?.message}
            {...register('price')}
            placeholder="19999000"
          />
          <Input
            label="Harga Beli"
            type="number"
            error={errors.cost_price?.message}
            {...register('cost_price')}
            placeholder="17000000"
          />
          <Input
            label="Harga Diskon"
            type="number"
            error={errors.discount_price?.message}
            {...register('discount_price')}
            placeholder="Opsional, kosongkan jika tidak ada diskon"
          />
          <Input
            label="Stok"
            type="number"
            error={errors.stock_quantity?.message}
            {...register('stock_quantity')}
            placeholder="50"
          />
          <Input
            label="Stok Minimum"
            type="number"
            error={errors.min_stock?.message}
            {...register('min_stock')}
            placeholder="5"
          />
          <Select
            label="Kategori *"
            error={errors.category_id?.message}
            {...register('category_id')}
            options={categories.map(c => ({ value: String(c.id), label: c.name }))}
            placeholder="Pilih kategori"
          />
          <Select
            label="Merek"
            error={errors.brand_id?.message}
            {...register('brand_id')}
            options={[{ value: '', label: 'Tidak ada merek' }, ...brands.map(b => ({ value: String(b.id), label: b.name }))]}
            placeholder="Pilih merek (opsional)"
          />
          <Select
            label="Supplier"
            error={errors.supplier_id?.message}
            {...register('supplier_id')}
            options={[{ value: '', label: 'Tidak ada supplier' }, ...suppliers.map(s => ({ value: String(s.id), label: s.name }))]}
            placeholder="Pilih supplier (opsional)"
          />
          <Select
            label="Tipe Produk *"
            error={errors.type?.message}
            {...register('type')}
            options={[
              { value: 'ecommerce', label: 'E-Commerce' },
              { value: 'pos', label: 'POS' },
            ]}
            placeholder="Pilih tipe"
          />
          <div className="md:col-span-2">
            <Textarea
              label="Deskripsi Lengkap"
              error={errors.description?.message}
              {...register('description')}
              rows={4}
              placeholder="Deskripsi detail produk..."
            />
          </div>
          <div className="md:col-span-2">
            <Textarea
              label="Deskripsi Singkat"
              error={errors.short_description?.message}
              {...register('short_description')}
              rows={2}
              placeholder="Ringkasan singkat untuk katalog..."
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-4">
            <Checkbox label="Aktif" {...register('is_active')} />
            <Checkbox label="Unggulan" {...register('is_featured')} />
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