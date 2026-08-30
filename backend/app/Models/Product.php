<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Product extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, LogsActivity, InteractsWithMedia;

    protected $fillable = [
        'name',
        'slug',
        'sku',
        'barcode',
        'description',
        'short_description',
        'price',
        'cost_price',
        'stock_quantity',
        'min_stock',
        'max_stock',
        'weight',
        'dimensions',
        'category_id',
        'brand_id',
        'supplier_id',
        'is_active',
        'is_featured',
        'is_digital',
        'type',
        'tax_rate',
        'discount_price',
        'meta_title',
        'meta_description',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'cost_price' => 'decimal:2',
            'discount_price' => 'decimal:2',
            'stock_quantity' => 'integer',
            'min_stock' => 'integer',
            'max_stock' => 'integer',
            'weight' => 'decimal:2',
            'tax_rate' => 'decimal:2',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_digital' => 'boolean',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnly(['name', 'price', 'stock_quantity']);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function posItems()
    {
        return $this->hasMany(PosItem::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeInStock($query)
    {
        return $query->where('stock_quantity', '>', 0);
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('stock_quantity', '<=', 'min_stock');
    }

    public function scopeForEcommerce($query)
    {
        return $query->where('type', 'ecommerce');
    }

    public function scopeForPos($query)
    {
        return $query->where('type', 'pos');
    }

    public function isOutOfStock()
    {
        return $this->stock_quantity <= 0;
    }

    public function isLowStock()
    {
        return $this->stock_quantity <= $this->min_stock;
    }

    public function getDiscountedPrice()
    {
        if ($this->discount_price && $this->discount_price < $this->price) {
            return $this->discount_price;
        }
        return $this->price;
    }

    public function getDiscountPercentage()
    {
        if ($this->discount_price && $this->discount_price < $this->price) {
            return round((($this->price - $this->discount_price) / $this->price) * 100, 2);
        }
        return 0;
    }
}
