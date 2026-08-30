<?php

namespace App\Services\Inventory;

use App\Models\Product;
use App\Models\StockMovement;

class InventoryService
{
    public function addStock(Product $product, int $quantity, string $reason = 'purchase', $referenceId = null)
    {
        $product->increment('stock_quantity', $quantity);

        StockMovement::create([
            'product_id' => $product->id,
            'type' => 'in',
            'quantity' => $quantity,
            'reason' => $reason,
            'reference_type' => $referenceId ? get_class($referenceId) : null,
            'reference_id' => $referenceId?->id,
            'stock_before' => $product->stock_quantity - $quantity,
            'stock_after' => $product->stock_quantity,
        ]);

        return $product;
    }

    public function reduceStock(Product $product, int $quantity, string $reason = 'sale', $referenceId = null)
    {
        if ($product->stock_quantity < $quantity) {
            throw new \Exception('Stok tidak mencukupi');
        }

        $product->decrement('stock_quantity', $quantity);

        StockMovement::create([
            'product_id' => $product->id,
            'type' => 'out',
            'quantity' => $quantity,
            'reason' => $reason,
            'reference_type' => $referenceId ? get_class($referenceId) : null,
            'reference_id' => $referenceId?->id,
            'stock_before' => $product->stock_quantity + $quantity,
            'stock_after' => $product->stock_quantity,
        ]);

        return $product;
    }

    public function adjustStock(Product $product, int $newQuantity, string $reason = 'adjustment')
    {
        $oldQuantity = $product->stock_quantity;
        $difference = $newQuantity - $oldQuantity;

        $product->update(['stock_quantity' => $newQuantity]);

        StockMovement::create([
            'product_id' => $product->id,
            'type' => $difference > 0 ? 'in' : 'out',
            'quantity' => abs($difference),
            'reason' => $reason,
            'stock_before' => $oldQuantity,
            'stock_after' => $newQuantity,
        ]);

        return $product;
    }

    public function checkLowStock()
    {
        return Product::whereColumn('stock_quantity', '<=', 'min_stock')
            ->where('is_active', true)
            ->get();
    }

    public function getStockMovements(Product $product, $limit = 50)
    {
        return StockMovement::where('product_id', $product->id)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}
