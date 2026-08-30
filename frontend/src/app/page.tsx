'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ecommerceApi } from '@/lib/services/ecommerce';
import { ProductCard } from '@/components/ecommerce/product-card';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  useEffect(() => {
    ecommerceApi
      .getProducts({ per_page: 4 })
      .then((response) => {
        setProducts(response.data.data.data || []);
        setApiOnline(true);
      })
      .catch(() => setApiOnline(false));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-white/10 bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold tracking-tight">FIYAN<span className="text-cyan-400">.</span></Link>
          <div className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <Link href="/ecommerce" className="hover:text-white">Toko</Link>
            <Link href="/login" className="hover:text-white">Dashboard</Link>
            <Link href="/ecommerce/cart" className="hover:text-white">Keranjang</Link>
          </div>
          <Link href="/ecommerce" className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">Belanja sekarang</Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-300">
            <span className={`h-2 w-2 rounded-full ${apiOnline === true ? 'bg-emerald-400' : apiOnline === false ? 'bg-red-400' : 'bg-amber-400'}`} />
            {apiOnline === true ? 'Backend terhubung' : apiOnline === false ? 'Mode offline' : 'Menghubungkan backend'}
          </div>
          <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">Satu ruang kerja untuk bisnis yang bergerak cepat.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">Kelola toko online, stok, transaksi kasir, invoice, dan konten dari satu platform Fiyan.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/ecommerce" className="rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300">Lihat katalog</Link>
            <Link href="/login" className="rounded-lg border border-white/15 px-5 py-3 font-semibold text-white hover:bg-white/10">Masuk ke dashboard</Link>
          </div>
          <div className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6">
            <div><p className="text-2xl font-bold">{products.length || '-'}</p><p className="mt-1 text-xs text-slate-500">produk aktif</p></div>
            <div><p className="text-2xl font-bold">4</p><p className="mt-1 text-xs text-slate-500">modul bisnis</p></div>
            <div><p className="text-2xl font-bold">24/7</p><p className="mt-1 text-xs text-slate-500">siap dipantau</p></div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/20 via-slate-900 to-orange-300/10 p-6 shadow-2xl shadow-cyan-950/30">
          <div className="flex items-center justify-between border-b border-white/10 pb-5"><div><p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Live workspace</p><p className="mt-1 text-lg font-semibold">Ringkasan hari ini</p></div><span className="rounded-md bg-emerald-400/15 px-2 py-1 text-xs text-emerald-300">Aktif</span></div>
          <div className="grid grid-cols-2 gap-3 py-6"><div className="rounded-xl bg-white/5 p-4"><p className="text-xs text-slate-400">Penjualan</p><p className="mt-2 text-xl font-bold">{formatCurrency(0)}</p><p className="mt-1 text-xs text-emerald-300">+12.4%</p></div><div className="rounded-xl bg-white/5 p-4"><p className="text-xs text-slate-400">Stok tersedia</p><p className="mt-2 text-xl font-bold">{products.reduce((total, product) => total + product.stock_quantity, 0) || '-'}</p><p className="mt-1 text-xs text-slate-400">dari API produk</p></div></div>
          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4"><div className="flex items-center justify-between text-sm"><span className="text-slate-300">Status integrasi</span><span className="text-cyan-300">Laravel API</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-4/5 rounded-full bg-cyan-400" /></div><p className="mt-3 text-xs text-slate-500">Katalog, autentikasi, POS, ERP, dan CMS berada dalam satu alur kerja.</p></div>
        </div>
      </section>

      <section className="bg-slate-900/70 px-6 py-16"><div className="mx-auto max-w-7xl"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-sm font-medium text-cyan-300">Dari backend ke layar Anda</p><h2 className="mt-2 text-3xl font-bold">Produk terbaru</h2></div><Link href="/ecommerce" className="text-sm font-medium text-slate-400 hover:text-white">Lihat semua produk</Link></div>{products.length > 0 ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">{apiOnline === false ? 'Backend belum tersambung. Jalankan Laravel di port 8000.' : 'Memuat produk dari backend...'}</div>}</div></section>
    </main>
  );
}
