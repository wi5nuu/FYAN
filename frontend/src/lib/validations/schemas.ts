import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi'),
  slug: z.string().min(1, 'Slug wajib diisi').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
  sku: z.string().min(1, 'SKU wajib diisi'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Harga harus lebih dari 0'),
  cost_price: z.coerce.number().min(0, 'Harga modal harus lebih dari 0').optional(),
  stock_quantity: z.coerce.number().min(0, 'Stok harus lebih dari 0'),
  low_stock_threshold: z.coerce.number().min(0).optional(),
  category_id: z.coerce.number().min(1, 'Kategori wajib dipilih'),
  brand_id: z.coerce.number().optional(),
  supplier_id: z.coerce.number().optional(),
  is_active: z.boolean().default(true),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi'),
  slug: z.string().min(1, 'Slug wajib diisi').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
  description: z.string().optional(),
  sort_order: z.coerce.number().min(0).optional(),
  is_active: z.boolean().default(true),
});

export const brandSchema = z.object({
  name: z.string().min(1, 'Nama brand wajib diisi'),
  slug: z.string().min(1, 'Slug wajib diisi').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

export const customerSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postal_code: z.string().optional(),
  is_active: z.boolean().default(true),
});

export const supplierSchema = z.object({
  name: z.string().min(1, 'Nama supplier wajib diisi'),
  slug: z.string().min(1, 'Slug wajib diisi').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
});

export const pageSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  slug: z.string().min(1, 'Slug wajib diisi').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
  content: z.string().min(1, 'Konten wajib diisi'),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  template: z.string().optional(),
  is_homepage: z.boolean().default(false),
  sort_order: z.coerce.number().min(0).optional(),
});

export const postSchema = z.object({
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
});

export type ProductFormData = z.output<typeof productSchema>;
export type CategoryFormData = z.output<typeof categorySchema>;
export type BrandFormData = z.output<typeof brandSchema>;
export type CustomerFormData = z.output<typeof customerSchema>;
export type SupplierFormData = z.output<typeof supplierSchema>;
export type PageFormData = z.output<typeof pageSchema>;
export type PostFormData = z.output<typeof postSchema>;