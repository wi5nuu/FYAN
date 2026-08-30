'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { ecommerceApi } from '@/lib/services/ecommerce';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const shipping = items.length > 0 ? 25000 : 0;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    if (!localStorage.getItem('token')) {
      toast.error('Silakan login untuk melanjutkan checkout.');
      router.push('/login');
      return;
    }

    if (!shippingAddress.trim() || !city.trim() || !province.trim() || !postalCode.trim()) {
      toast.error('Alamat pengiriman wajib diisi.');
      return;
    }

    setCheckoutLoading(true);
    try {
      for (const item of items) {
        await ecommerceApi.addToCart(item.product.id, item.quantity);
      }

      await ecommerceApi.createOrder({
        shipping_address: {
          street: shippingAddress.trim(),
          city: city.trim(),
          province: province.trim(),
          postal_code: postalCode.trim(),
        },
        payment_method: paymentMethod,
      });
      clearCart();
      toast.success('Pesanan berhasil dibuat melalui backend.');
      router.push('/ecommerce/orders');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Checkout gagal diproses.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div>
        <PageHeader title="Keranjang Belanja" description="Belum ada produk di keranjang Anda." />
        <EmptyState
          title="Keranjang masih kosong"
          description="Tambahkan produk favorit Anda untuk memulai checkout."
          action={
            <Link href="/ecommerce">
              <Button>Belanja Sekarang</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Keranjang Belanja" description="Review produk sebelum checkout." />

      <div className="grid gap-6 lg:grid-cols-[1.7fr_0.9fr]">
        <div className="space-y-4">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row">
              <div className="h-24 w-full overflow-hidden rounded-xl bg-gray-100 sm:w-24">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl text-purple-300">◈</div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.category?.name || 'Produk'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(product.id)}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Hapus
                  </button>
                </div>

                <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200">
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="h-9 w-9 text-lg text-gray-600 hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="min-w-10 text-center text-sm font-medium">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="h-9 w-9 text-lg text-gray-600 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  <p className="text-lg font-bold text-purple-700">
                    {formatCurrency(product.discount_price ?? product.price * quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Ringkasan</h3>

          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Biaya pengiriman</span>
              <span>{formatCurrency(shipping)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-base font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <label className="mt-5 block text-sm font-medium text-gray-700">
            Alamat pengiriman
            <textarea
              value={shippingAddress}
              onChange={(event) => setShippingAddress(event.target.value)}
              className="mt-2 min-h-24 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-500"
              placeholder="Masukkan alamat lengkap"
            />
          </label>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input value={city} onChange={(event) => setCity(event.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-purple-500" placeholder="Kota" />
            <input value={province} onChange={(event) => setProvince(event.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-purple-500" placeholder="Provinsi" />
            <input value={postalCode} onChange={(event) => setPostalCode(event.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-purple-500" placeholder="Kode pos" />
          </div>

          <label className="mt-4 block text-sm font-medium text-gray-700">
            Metode pembayaran
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-500"
            >
              <option value="bank_transfer">Transfer Bank</option>
              <option value="cod">Bayar di Tempat</option>
              <option value="credit_card">Kartu Kredit</option>
            </select>
          </label>

          <Button className="mt-6 w-full" onClick={handleCheckout} disabled={checkoutLoading}>
            {checkoutLoading ? 'Memproses...' : 'Checkout'}
          </Button>
          <button
            type="button"
            onClick={clearCart}
            className="mt-3 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Kosongkan Keranjang
          </button>
        </aside>
      </div>
    </div>
  );
}
