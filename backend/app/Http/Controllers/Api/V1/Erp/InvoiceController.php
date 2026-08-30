<?php

namespace App\Http\Controllers\Api\V1\Erp;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    /**
     * Get all invoices
     */
    public function index(Request $request)
    {
        $query = Invoice::with(['customer', 'order', 'user']);

        // Filter by type
        if ($request->has('type')) {
            $query->byType($request->type);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
        }

        // Get overdue invoices
        if ($request->has('overdue') && $request->overdue) {
            $query->overdue();
        }

        $invoices = $query->latest()->paginate(20);

        return response()->json([
            'success' => true,
            'data' => [
                'invoices' => $invoices,
            ],
        ]);
    }

    /**
     * Get single invoice
     */
    public function show(string $invoiceNumber)
    {
        $invoice = Invoice::with(['customer', 'order', 'user', 'items', 'payments'])
            ->where('invoice_number', $invoiceNumber)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => [
                'invoice' => $invoice,
            ],
        ]);
    }

    /**
     * Create invoice
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'order_id' => 'nullable|exists:orders,id',
            'type' => 'required|string|in:sales,purchase',
            'due_date' => 'required|date|after:today',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_rate' => 'nullable|numeric|min:0|max:100',
            'notes' => 'nullable|string|max:500',
            'terms' => 'nullable|string|max:1000',
        ]);

        $subtotal = 0;
        $taxAmount = 0;

        foreach ($validated['items'] as $item) {
            $itemSubtotal = $item['quantity'] * $item['unit_price'];
            $itemTax = $itemSubtotal * (($item['tax_rate'] ?? 11) / 100);
            $subtotal += $itemSubtotal;
            $taxAmount += $itemTax;
        }

        $totalAmount = $subtotal + $taxAmount;

        DB::beginTransaction();

        try {
            $invoice = Invoice::create([
                'user_id' => $request->user()->id,
                'customer_id' => $validated['customer_id'],
                'order_id' => $validated['order_id'] ?? null,
                'type' => $validated['type'],
                'status' => 'pending',
                'due_date' => $validated['due_date'],
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'paid_amount' => 0,
                'remaining_amount' => $totalAmount,
                'notes' => $validated['notes'] ?? null,
                'terms' => $validated['terms'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $itemSubtotal = $item['quantity'] * $item['unit_price'];
                $itemTax = $itemSubtotal * (($item['tax_rate'] ?? 11) / 100);

                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'tax_rate' => $item['tax_rate'] ?? 11,
                    'tax_amount' => $itemTax,
                    'total' => $itemSubtotal + $itemTax,
                ]);
            }

            DB::commit();

            $invoice->load(['customer', 'order', 'user', 'items']);

            return response()->json([
                'success' => true,
                'message' => 'Invoice berhasil dibuat',
                'data' => [
                    'invoice' => $invoice,
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat invoice: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Record payment for invoice
     */
    public function recordPayment(Request $request, string $invoiceNumber)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|in:cash,bank_transfer,credit_card,debit_card,e_wallet',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500',
        ]);

        $invoice = Invoice::where('invoice_number', $invoiceNumber)->firstOrFail();

        if ($validated['amount'] > $invoice->remaining_amount) {
            return response()->json([
                'success' => false,
                'message' => 'Jumlah pembayaran melebihi sisa tagihan',
            ], 400);
        }

        $invoice->partialPayment($validated['amount']);

        // Create payment record
        $invoice->payments()->create([
            'user_id' => $request->user()->id,
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'reference' => $validated['reference'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil dicatat',
            'data' => [
                'invoice' => $invoice->fresh(),
            ],
        ]);
    }

    /**
     * Get invoice summary
     */
    public function summary(Request $request)
    {
        $summary = Invoice::selectRaw('
            COUNT(*) as total_invoices,
            SUM(total_amount) as total_amount,
            SUM(paid_amount) as paid_amount,
            SUM(remaining_amount) as remaining_amount,
            COUNT(CASE WHEN status = "pending" THEN 1 END) as pending_count,
            COUNT(CASE WHEN status = "paid" THEN 1 END) as paid_count,
            COUNT(CASE WHEN status = "partial" THEN 1 END) as partial_count
        ')->first();

        $overdue = Invoice::overdue()->count();

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $summary,
                'overdue_count' => $overdue,
            ],
        ]);
    }
}
