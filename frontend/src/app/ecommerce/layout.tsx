import Link from 'next/link';
import { EcommerceNav } from '@/components/ecommerce/ecommerce-nav';

export default function EcommerceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b border-purple-900/20 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/ecommerce" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <div>
                <span className="text-lg font-bold text-white">Fiyan Store</span>
                <span className="hidden text-xs text-purple-200 sm:block">Toko Online Terpercaya</span>
              </div>
            </Link>

            <EcommerceNav />

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="hidden text-sm text-purple-200 transition-colors hover:text-white sm:block"
              >
                Beranda
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-600"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>

      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Fiyan Project. Semua hak dilindungi.</p>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/ecommerce" className="hover:text-purple-600">
                Produk
              </Link>
              <Link href="/ecommerce/cart" className="hover:text-purple-600">
                Keranjang
              </Link>
              <Link href="/ecommerce/orders" className="hover:text-purple-600">
                Pesanan
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
