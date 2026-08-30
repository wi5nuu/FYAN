<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Shipment;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['user', 'items.product']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        $orders = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => ['orders' => $orders],
        ]);
    }

    public function show(string $orderNumber)
    {
        $order = Order::with(['user', 'items.product', 'payments', 'shipments'])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => ['order' => $order],
        ]);
    }

    public function updateStatus(Request $request, string $orderNumber)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,confirmed,processing,shipped,delivered,cancelled,refunded',
            'payment_status' => 'nullable|string|in:pending,paid,partial,failed,refunded',
            'tracking_number' => 'nullable|string|max:100',
            'courier' => 'nullable|string|max:100',
        ]);

        $order = Order::where('order_number', $orderNumber)->firstOrFail();
        $previousStatus = $order->status;

        DB::beginTransaction();

        try {
            $order->update($validated);

            // Handle status transitions
            if ($validated['status'] === 'shipped' && !$order->shipped_at) {
                $order->update(['shipped_at' => now()]);

                // Create shipment record
                if ($validated['tracking_number'] || $validated['courier']) {
                    Shipment::create([
                        'order_id' => $order->id,
                        'courier' => $validated['courier'] ?? 'Unknown',
                        'tracking_number' => $validated['tracking_number'] ?? null,
                        'status' => 'shipped',
                        'shipped_at' => now(),
                        'shipping_address' => $order->shipping_address,
                    ]);
                }
            }

            if ($validated['status'] === 'delivered' && !$order->delivered_at) {
                $order->update(['delivered_at' => now()]);

                // Update shipment status
                $order->shipments()->where('status', 'shipped')->update([
                    'status' => 'delivered',
                    'delivered_at' => now(),
                ]);
            }

            // Restore stock on cancellation or refund
            if (in_array($validated['status'], ['cancelled', 'refunded']) && !in_array($previousStatus, ['cancelled', 'refunded'])) {
                foreach ($order->items as $item) {
                    $item->product->increment('stock_quantity', $item->quantity);

                    StockMovement::create([
                        'product_id' => $item->product_id,
                        'type' => 'in',
                        'quantity' => $item->quantity,
                        'reference' => $order->order_number,
                        'notes' => ucfirst($validated['status']) . ' pesanan',
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Status pesanan berhasil diperbarui',
                'data' => ['order' => $order->fresh(['user', 'items.product', 'shipments'])],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui status: ' . $e->getMessage(),
            ], 500);
        }
    }
}
