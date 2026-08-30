<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PosPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'amount',
        'payment_method',
        'reference',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
        ];
    }

    public function transaction()
    {
        return $this->belongsTo(PosTransaction::class, 'transaction_id');
    }
}
