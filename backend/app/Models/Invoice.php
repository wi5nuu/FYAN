<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Illuminate\Support\Str;

class Invoice extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'invoice_number',
        'user_id',
        'customer_id',
        'order_id',
        'type',
        'status',
        'due_date',
        'paid_at',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'paid_amount',
        'remaining_amount',
        'currency',
        'notes',
        'terms',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'paid_at' => 'datetime',
            'subtotal' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'remaining_amount' => 'decimal:2',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnly(['invoice_number', 'status', 'total_amount']);
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($invoice) {
            if (empty($invoice->invoice_number)) {
                $invoice->invoice_number = 'INV-' . strtoupper(Str::random(10));
            }
            $invoice->remaining_amount = $invoice->total_amount - $invoice->paid_amount;
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'pending')
                     ->where('due_date', '<', now());
    }

    public function markAsPaid($amount = null)
    {
        $paidAmount = $amount ?? $this->total_amount;
        $this->update([
            'status' => 'paid',
            'paid_amount' => $paidAmount,
            'remaining_amount' => 0,
            'paid_at' => now(),
        ]);
    }

    public function partialPayment($amount)
    {
        $newPaidAmount = $this->paid_amount + $amount;
        $this->update([
            'paid_amount' => $newPaidAmount,
            'remaining_amount' => $this->total_amount - $newPaidAmount,
            'status' => $newPaidAmount >= $this->total_amount ? 'paid' : 'partial',
        ]);
    }

    public function isOverdue()
    {
        return $this->status === 'pending' && $this->due_date < now();
    }
}
