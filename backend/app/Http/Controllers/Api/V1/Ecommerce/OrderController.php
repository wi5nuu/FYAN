<?php

namespace App\Http\Controllers\Api\V1\Ecommerce;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\Product;
use App\Models\Invoice;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * Get user orders
     */
    public function index(Request $request)
    {
        $orders = Order::with(['items.product', 'payments'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => [
                'orders' => $orders,
            ],
        ]);
    }

    /**
     * Get single order
     */
    public function show(Request $request, string $orderNumber)
    {
        $order = Order::with(['items.product', 'payments', 'shipments'])
            ->where('user_id', $request->user()->id)
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => [
                'order' => $order,
            ],
        ]);
    }

    /**
     * Create order from cart
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'shipping_address' => 'required|array',
            'shipping_address.street' => 'required|string',
            'shipping_address.city' => 'required|string',
            'shipping_address.province' => 'required|string',
            'shipping_address.postal_code' => 'required|string',
            'billing_address' => 'nullable|array',
            'notes' => 'nullable|string|max:500',
            'payment_method' => 'required|string|in:bank_transfer,credit_card,cod,e_wallet',
        ]);

        $cart = Cart::with('items.product')
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($cart->items->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Keranjang kosong',
            ], 400);
        }

        // Validate stock
        foreach ($cart->items as $item) {
            if ($item->product->stock_quantity < $item->quantity) {
                return response()->json([
                    'success' => false,
                    'message' => "Stok {$item->product->name} tidak mencukupi",
                ], 400);
            }
        }

        $subtotal = $cart->items->sum(function ($item) {
            return $item->price * $item->quantity;
        });

        $taxAmount = $subtotal * 0.11; // PPN 11%
        $shippingCost = 15000; // Flat rate
        $totalAmount = $subtotal + $taxAmount + $shippingCost;

        DB::beginTransaction();

        try {
            // Create order
            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(Str::random(10)),
                'user_id' => $request->user()->id,
                'status' => 'pending',
                'payment_status' => 'pending',
                'payment_method' => $validated['payment_method'],
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'shipping_cost' => $shippingCost,
                'total_amount' => $totalAmount,
                'shipping_address' => $validated['shipping_address'],
                'billing_address' => $validated['billing_address'] ?? $validated['shipping_address'],
                'notes' => $validated['notes'] ?? null,
            ]);

            // Create order items
            foreach ($cart->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'total' => $item->price * $item->quantity,
                ]);

                // Update stock
                $item->product->decrement('stock_quantity', $item->quantity);
            }

            // Create invoice
            Invoice::create([
                'user_id' => $request->user()->id,
                'order_id' => $order->id,
                'type' => 'sales',
                'status' => 'pending',
                'due_date' => now()->addDays(7),
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
            ]);

            // Clear cart
            $cart->items()->delete();

            DB::commit();

            $order->load(['items.product', 'payments']);

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat',
                'data' => [
                    'order' => $order,
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat pesanan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cancel order
     */
    public function cancel(Request $request, string $orderNumber)
    {
        $order = Order::where('user_id', $request->user()->id)
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak dapat dibatalkan',
            ], 400);
        }

        $reason = $request->reason ?? 'Dibatalkan oleh pelanggan';

        DB::beginTransaction();

        try {
            // Restore stock
            foreach ($order->items as $item) {
                $item->product->increment('stock_quantity', $item->quantity);

                // Create stock movement for cancellation
                StockMovement::create([
                    'product_id' => $item->product_id,
                    'type' => 'in',
                    'quantity' => $item->quantity,
                    'reference' => $order->order_number,
                    'notes' => 'Pembatalan pesanan: ' . $reason,
                ]);
            }

            $order->cancel($reason);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibatalkan',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membatalkan pesanan: ' . $e->getMessage(),
            ], 500);
        }
    }
}
