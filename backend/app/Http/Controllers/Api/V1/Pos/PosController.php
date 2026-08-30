<?php

namespace App\Http\Controllers\Api\V1\Pos;

use App\Http\Controllers\Controller;
use App\Models\PosTransaction;
use App\Models\PosItem;
use App\Models\PosPayment;
use App\Models\Product;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PosController extends Controller
{
    /**
     * Get all POS transactions
     */
    public function index(Request $request)
    {
        $query = PosTransaction::with(['customer', 'items.product', 'cashier']);

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->byDateRange($request->start_date, $request->end_date);
        } else {
            $query->today();
        }

        // Filter by status
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        $transactions = $query->latest()->paginate(20);

        return response()->json([
            'success' => true,
            'data' => [
                'transactions' => $transactions,
            ],
        ]);
    }

    /**
     * Get single POS transaction
     */
    public function show(string $transactionNumber)
    {
        $transaction = PosTransaction::with(['customer', 'items.product', 'cashier', 'payments'])
            ->where('transaction_number', $transactionNumber)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => [
                'transaction' => $transaction,
            ],
        ]);
    }

    /**
     * Create POS transaction
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.discount' => 'nullable|numeric|min:0',
            'payment_method' => 'required|string|in:cash,credit_card,debit_card,e_wallet,bank_transfer',
            'payment_amount' => 'required|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:500',
        ]);

        // Validate stock
        foreach ($validated['items'] as $item) {
            $product = Product::findOrFail($item['product_id']);
            if ($product->stock_quantity < $item['quantity']) {
                return response()->json([
                    'success' => false,
                    'message' => "Stok {$product->name} tidak mencukupi",
                ], 400);
            }
        }

        $subtotal = 0;
        $items = [];

        foreach ($validated['items'] as $item) {
            $product = Product::findOrFail($item['product_id']);
            $itemTotal = ($product->price * $item['quantity']) - ($item['discount'] ?? 0);
            $subtotal += $itemTotal;

            $items[] = [
                'product_id' => $product->id,
                'quantity' => $item['quantity'],
                'price' => $product->price,
                'discount' => $item['discount'] ?? 0,
                'total' => $itemTotal,
            ];
        }

        $taxAmount = $subtotal * 0.11;
        $discountAmount = $validated['discount_amount'] ?? 0;
        $totalAmount = $subtotal + $taxAmount - $discountAmount;
        $changeAmount = $validated['payment_amount'] - $totalAmount;

        if ($changeAmount < 0) {
            return response()->json([
                'success' => false,
                'message' => 'Jumlah pembayaran kurang dari total',
            ], 400);
        }

        DB::beginTransaction();

        try {
            $transaction = PosTransaction::create([
                'transaction_number' => 'POS-' . strtoupper(Str::random(10)),
                'cashier_id' => $request->user()->id,
                'customer_id' => $validated['customer_id'] ?? null,
                'status' => 'completed',
                'payment_method' => $validated['payment_method'],
                'payment_amount' => $validated['payment_amount'],
                'change_amount' => $changeAmount,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'discount_amount' => $discountAmount,
                'total_amount' => $totalAmount,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($items as $item) {
                PosItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'discount' => $item['discount'],
                    'total' => $item['total'],
                ]);

                // Update stock
                Product::where('id', $item['product_id'])
                    ->decrement('stock_quantity', $item['quantity']);
            }

            // Create payment record
            PosPayment::create([
                'transaction_id' => $transaction->id,
                'payment_method' => $validated['payment_method'],
                'amount' => $validated['payment_amount'],
                'reference' => null,
            ]);

            DB::commit();

            $transaction->load(['items.product', 'customer', 'cashier']);

            return response()->json([
                'success' => true,
                'message' => 'Transaksi POS berhasil dibuat',
                'data' => [
                    'transaction' => $transaction,
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat transaksi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get POS summary for today
     */
    public function summary(Request $request)
    {
        $startDate = $request->get('start_date', today()->startOfDay());
        $endDate = $request->get('end_date', today()->endOfDay());

        $summary = PosTransaction::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('
                COUNT(*) as total_transactions,
                SUM(total_amount) as total_revenue,
                SUM(tax_amount) as total_tax,
                SUM(discount_amount) as total_discounts,
                AVG(total_amount) as average_transaction
            ')
            ->first();

        $todaySummary = PosTransaction::whereBetween('created_at', [today()->startOfDay(), today()->endOfDay()])
            ->selectRaw('COUNT(*) as total_transactions, SUM(total_amount) as total_revenue')
            ->first();

        $monthSummary = PosTransaction::whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->selectRaw('COUNT(*) as total_transactions, SUM(total_amount) as total_revenue')
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $summary,
                'today_transactions' => (int) ($todaySummary->total_transactions ?? 0),
                'today_revenue' => (float) ($todaySummary->total_revenue ?? 0),
                'month_revenue' => (float) ($monthSummary->total_revenue ?? 0),
                'payment_methods' => $paymentMethods,
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
            ],
        ]);
    }

    /**
     * Get POS products for quick access
     */
    public function products(Request $request)
    {
        $query = Product::active()->forPos()->with('category');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $products = $query->paginate(50);

        return response()->json([
            'success' => true,
            'data' => [
                'products' => $products,
            ],
        ]);
    }
}
