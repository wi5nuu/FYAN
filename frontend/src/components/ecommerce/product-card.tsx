'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

function getDisplayPrice(product: Product) {
  return product.discount_price ?? product.price;
}

function ProductImage({ product }: { product: Product }) {
  const imageUrl = product.images?.[0];

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={product.name}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
      <svg className="h-16 w-16 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    </div>
  );
}

export function ProductCard({ product }: ProductCardProps) {
  const displayPrice = getDisplayPrice(product);
  const hasDiscount = product.discount_price != null && product.discount_price < product.price;
  const outOfStock = product.stock_quantity <= 0;

  return (
    <Link href={`/ecommerce/products/${product.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden transition-all duration-200 hover:border-purple-200 hover:shadow-md">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <ProductImage product={product} />
          {product.is_featured && (
            <span className="absolute left-3 top-3 rounded-full bg-purple-600 px-2.5 py-0.5 text-xs font-medium text-white">
              Unggulan
            </span>
          )}
          {outOfStock && (
            <span className="absolute right-3 top-3">
              <Badge status="inactive" label="Habis" />
            </span>
          )}
        </div>
        <CardContent className="p-4">
          {product.category && (
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-purple-600">
              {product.category.name}
            </p>
          )}
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-gray-900 group-hover:text-purple-700">
            {product.name}
          </h3>
          {product.short_description && (
            <p className="mt-1 line-clamp-2 text-xs text-gray-500">{product.short_description}</p>
          )}
          <div className="mt-3 flex items-end justify-between gap-2">
            <div>
              <p className="text-lg font-bold text-purple-700">{formatCurrency(displayPrice)}</p>
              {hasDiscount && (
                <p className="text-xs text-gray-400 line-through">{formatCurrency(product.price)}</p>
              )}
            </div>
            {!outOfStock && (
              <span className="text-xs text-gray-500">Stok: {product.stock_quantity}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
