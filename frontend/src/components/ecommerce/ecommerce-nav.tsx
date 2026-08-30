'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/ecommerce', label: 'Home', exact: true },
  { href: '/ecommerce', label: 'Produk', exact: false },
  { href: '/ecommerce/cart', label: 'Keranjang' },
  { href: '/ecommerce/orders', label: 'Pesanan' },
];

export function EcommerceNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    if (href === '/ecommerce') {
      return pathname === '/ecommerce' || pathname.startsWith('/ecommerce/products');
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            isActive(item.href, item.exact)
              ? 'bg-purple-600 text-white'
              : 'text-purple-100 hover:bg-white/10 hover:text-white'
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
