<?php

namespace App\Http\Controllers\Api\V1\Erp;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseOrderController extends Controller
{
    /**
     * Get all purchase orders
     */
    public function index(Request $request)
    {
        $query = PurchaseOrder::with(['supplier', 'user', 'items.product']);

        // Filter by status
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
        }

        $purchaseOrders = $query->latest()->paginate(20);

        return response()->json([
            'success' => true,
            'data' => [
                'purchase_orders' => $purchaseOrders,
            ],
        ]);
    }

    /**
     * Get single purchase order
     */
    public function show(string $poNumber)
    {
        $purchaseOrder = PurchaseOrder::with(['supplier', 'user', 'items.product'])
            ->where('po_number', $poNumber)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => [
                'purchase_order' => $purchaseOrder,
            ],
        ]);
    }

    /**
     * Create purchase order
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'expected_delivery_date' => 'required|date|after:today',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:500',
            'shipping_address' => 'nullable|array',
        ]);

        $subtotal = 0;

        foreach ($validated['items'] as $item) {
            $subtotal += $item['quantity'] * $item['unit_price'];
        }

        $taxAmount = $subtotal * 0.11;
        $totalAmount = $subtotal + $taxAmount;

        DB::beginTransaction();

        try {
            $purchaseOrder = PurchaseOrder::create([
                'supplier_id' => $validated['supplier_id'],
                'user_id' => $request->user()->id,
                'status' => 'draft',
                'order_date' => now(),
                'expected_delivery_date' => $validated['expected_delivery_date'],
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'notes' => $validated['notes'] ?? null,
                'shipping_address' => $validated['shipping_address'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                PurchaseOrderItem::create([
                    'purchase_order_id' => $purchaseOrder->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $item['quantity'] * $item['unit_price'],
                ]);
            }

            DB::commit();

            $purchaseOrder->load(['supplier', 'user', 'items.product']);

            return response()->json([
                'success' => true,
                'message' => 'Purchase Order berhasil dibuat',
                'data' => [
                    'purchase_order' => $purchaseOrder,
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat PO: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Approve purchase order
     */
    public function approve(string $poNumber)
    {
        $purchaseOrder = PurchaseOrder::where('po_number', $poNumber)->firstOrFail();

        if ($purchaseOrder->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'PO tidak dapat disetujui',
            ], 400);
        }

        $purchaseOrder->approve();

        return response()->json([
            'success' => true,
            'message' => 'PO berhasil disetujui',
        ]);
    }

    /**
     * Mark purchase order as received
     */
    public function receive(Request $request, string $poNumber)
    {
        $purchaseOrder = PurchaseOrder::with('items.product')
            ->where('po_number', $poNumber)
            ->firstOrFail();

        if (!in_array($purchaseOrder->status, ['approved', 'partial'])) {
            return response()->json([
                'success' => false,
                'message' => 'PO tidak dapat diterima',
            ], 400);
        }

        DB::beginTransaction();

        try {
            foreach ($purchaseOrder->items as $item) {
                // Update stock
                $item->product->increment('stock_quantity', $item->quantity);

                // Create stock movement
                StockMovement::create([
                    'product_id' => $item->product_id,
                    'type' => 'in',
                    'quantity' => $item->quantity,
                    'reference' => $poNumber,
                    'notes' => 'Penerimaan PO ' . $poNumber,
                ]);
            }

            $purchaseOrder->markAsReceived();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'PO berhasil diterima',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menerima PO: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cancel purchase order
     */
    public function cancel(string $poNumber)
    {
        $purchaseOrder = PurchaseOrder::where('po_number', $poNumber)->firstOrFail();

        if (in_array($purchaseOrder->status, ['received', 'cancelled'])) {
            return response()->json([
                'success' => false,
                'message' => 'PO tidak dapat dibatalkan',
            ], 400);
        }

        $purchaseOrder->cancel();

        return response()->json([
            'success' => true,
            'message' => 'PO berhasil dibatalkan',
        ]);
    }
}
