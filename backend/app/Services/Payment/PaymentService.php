<?php

namespace App\Services\Payment;

use App\Models\Payment;
use App\Models\Order;
use App\Models\Invoice;
use Illuminate\Support\Str;

class PaymentService
{
    public function createPayment(array $data)
    {
        $payment = Payment::create([
            'payment_number' => $this->generatePaymentNumber(),
            'order_id' => $data['order_id'] ?? null,
            'invoice_id' => $data['invoice_id'] ?? null,
            'amount' => $data['amount'],
            'payment_method' => $data['payment_method'],
            'status' => 'pending',
            'transaction_id' => $data['transaction_id'] ?? null,
            'payment_date' => now(),
            'notes' => $data['notes'] ?? null,
        ]);

        return $payment;
    }

    public function processPayment(Payment $payment, array $data)
    {
        $payment->update([
            'status' => 'completed',
            'transaction_id' => $data['transaction_id'] ?? null,
            'payment_date' => now(),
        ]);

        if ($payment->order_id) {
            $this->updateOrderStatus($payment->order);
        }

        if ($payment->invoice_id) {
            $this->updateInvoiceStatus($payment->invoice);
        }

        return $payment;
    }

    public function refundPayment(Payment $payment, $amount = null)
    {
        $refundAmount = $amount ?? $payment->amount;

        $payment->update([
            'status' => 'refunded',
            'refund_amount' => $refundAmount,
            'refund_date' => now(),
        ]);

        return $payment;
    }

    protected function updateOrderStatus(Order $order)
    {
        $totalPaid = $order->payments()->where('status', 'completed')->sum('amount');

        if ($totalPaid >= $order->total_amount) {
            $order->update(['payment_status' => 'paid']);
        } elseif ($totalPaid > 0) {
            $order->update(['payment_status' => 'partial']);
        }
    }

    protected function updateInvoiceStatus(Invoice $invoice)
    {
        $totalPaid = $invoice->payments()->where('status', 'completed')->sum('amount');

        if ($totalPaid >= $invoice->total_amount) {
            $invoice->update(['status' => 'paid']);
        } elseif ($totalPaid > 0) {
            $invoice->update(['status' => 'partial']);
        }
    }

    protected function generatePaymentNumber(): string
    {
        return 'PAY-' . date('Ymd') . '-' . strtoupper(Str::random(8));
    }
}
