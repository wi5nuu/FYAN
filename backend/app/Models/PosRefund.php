<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PosRefund extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'amount',
        'reason',
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
