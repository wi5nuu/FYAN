<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Illuminate\Support\Str;

class PosTransaction extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'transaction_number',
        'user_id',
        'cashier_id',
        'customer_id',
        'register_id',
        'status',
        'payment_method',
        'payment_amount',
        'change_amount',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'currency',
        'notes',
        'receipt_printed',
    ];

    protected function casts(): array
    {
        return [
            'payment_amount' => 'decimal:2',
            'change_amount' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'receipt_printed' => 'boolean',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnly(['transaction_number', 'status', 'total_amount']);
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($transaction) {
            if (empty($transaction->transaction_number)) {
                $transaction->transaction_number = 'POS-' . strtoupper(Str::random(10));
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function register()
    {
        return $this->belongsTo(PosRegister::class, 'register_id');
    }

    public function items()
    {
        return $this->hasMany(PosItem::class, 'transaction_id');
    }

    public function payments()
    {
        return $this->hasMany(PosPayment::class);
    }

    public function refunds()
    {
        return $this->hasMany(PosRefund::class);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function complete()
    {
        $this->update(['status' => 'completed']);
    }

    public function refund($reason = null)
    {
        $this->update([
            'status' => 'refunded',
            'notes' => $reason,
        ]);
    }
}
