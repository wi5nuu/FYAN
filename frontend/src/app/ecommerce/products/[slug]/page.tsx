'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { ecommerceApi } from '@/lib/services/ecommerce';
import { demoProducts } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { PageLoader } from '@/components/ui/spinner';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await ecommerceApi.getProduct(params.slug);
        setProduct(response.data.data.product);
      } catch {
        setProduct(demoProducts.find((item) => item.slug === params.slug) || null);
        toast.error('Produk dari backend tidak tersedia, menampilkan data demo.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.slug]);

  if (loading) return <PageLoader />;

  if (!product) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Produk tidak ditemukan</h1>
        <Link href="/ecommerce" className="mt-4 inline-block text-sm font-medium text-purple-600">
          Kembali ke katalog
        </Link>
      </div>
    );
  }

  const relatedProducts = demoProducts.filter((item) => item.id !== product.id).slice(0, 3);

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${product.name} berhasil ditambahkan ke keranjang.`);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/ecommerce" className="hover:text-purple-600">Produk</Link>
        <span>/</span>
        <span className="text-gray-700">{product.name}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-4">
          <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
            <img src={product.images?.[0]} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {(product.images || []).slice(0, 3).map((image, index) => (
              <div key={`${product.id}-${index}`} className="aspect-square overflow-hidden rounded-xl bg-gray-100">
                <img src={image} alt={`${product.name} view ${index + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          {product.is_featured && <Badge status="active" label="Produk Unggulan" className="bg-purple-100 text-purple-700" />}

          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-purple-600">
              {product.category?.name || 'Kategori'}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-purple-700">{formatCurrency(product.discount_price ?? product.price)}</span>
            {product.discount_price && product.discount_price < product.price && (
              <span className="text-lg text-gray-400 line-through">{formatCurrency(product.price)}</span>
            )}
          </div>

          <p className="text-gray-600">{product.description}</p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="text-xl text-gray-600">−</button>
              <span className="min-w-7 text-center text-sm font-medium">{quantity}</span>
              <button type="button" onClick={() => setQuantity((q) => q + 1)} className="text-xl text-gray-600">+</button>
            </div>
            <span className="text-sm text-gray-500">Stok tersedia: {product.stock_quantity}</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleAddToCart}>Tambah ke Keranjang</Button>
            <Link href="/ecommerce/cart">
              <Button variant="outline">Lihat Keranjang</Button>
            </Link>
          </div>

          <div className="grid gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 md:grid-cols-3">
            <div>
              <p className="font-semibold text-gray-900">SKU</p>
              <p>{product.sku}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Rating</p>
              <p>{product.average_rating ?? 4.8} / 5</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Ulasan</p>
              <p>{product.reviews_count ?? 0} review</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Produk Terkait</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {relatedProducts.map((item) => (
            <Link href={`/ecommerce/products/${item.slug}`} key={item.id}>
              <Card className="overflow-hidden transition hover:shadow-md">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img src={item.images?.[0]} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <CardContent className="p-4">
                  <h3 className="text-base font-semibold text-gray-900">{item.name}</h3>
                  <p className="mt-2 text-lg font-bold text-purple-700">{formatCurrency(item.discount_price ?? item.price)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
