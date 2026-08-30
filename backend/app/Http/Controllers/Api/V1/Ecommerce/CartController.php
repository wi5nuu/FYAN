<?php

namespace App\Http\Controllers\Api\V1\Ecommerce;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    /**
     * Get user cart
     */
    public function index(Request $request)
    {
        $cart = Cart::with(['items.product.category'])
            ->firstOrCreate(['user_id' => $request->user()->id]);

        return response()->json([
            'success' => true,
            'data' => [
                'cart' => $cart,
            ],
        ]);
    }

    /**
     * Add item to cart
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        if (!$product->is_active || $product->type !== 'ecommerce') {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak tersedia',
            ], 400);
        }

        if ($product->stock_quantity < $validated['quantity']) {
            return response()->json([
                'success' => false,
                'message' => 'Stok tidak mencukupi',
            ], 400);
        }

        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($cartItem) {
            $newQuantity = $cartItem->quantity + $validated['quantity'];
            if ($newQuantity > $product->stock_quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jumlah melebihi stok yang tersedia',
                ], 400);
            }
            $cartItem->update(['quantity' => $newQuantity]);
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $validated['product_id'],
                'quantity' => $validated['quantity'],
                'price' => $product->getDiscountedPrice(),
            ]);
        }

        $cart->refresh();
        $cart->load('items.product.category');

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil ditambahkan ke keranjang',
            'data' => [
                'cart' => $cart,
            ],
        ]);
    }

    /**
     * Update cart item quantity
     */
    public function update(Request $request, string $itemId)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem = CartItem::where('id', $itemId)
            ->whereHas('cart', fn ($query) => $query->where('user_id', $request->user()->id))
            ->firstOrFail();

        $product = $cartItem->product;

        if ($validated['quantity'] > $product->stock_quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Jumlah melebihi stok yang tersedia',
            ], 400);
        }

        $cartItem->update([
            'quantity' => $validated['quantity'],
            'price' => $product->getDiscountedPrice(),
        ]);

        $cart = Cart::with(['items.product.category'])
            ->where('user_id', $request->user()->id)
            ->first();

        return response()->json([
            'success' => true,
            'message' => 'Keranjang berhasil diperbarui',
            'data' => [
                'cart' => $cart,
            ],
        ]);
    }

    /**
     * Remove item from cart
     */
    public function destroy(Request $request, string $itemId)
    {
        $cartItem = CartItem::where('id', $itemId)
            ->whereHas('cart', fn ($query) => $query->where('user_id', $request->user()->id))
            ->firstOrFail();

        $cartItem->delete();

        $cart = Cart::with(['items.product.category'])
            ->where('user_id', $request->user()->id)
            ->first();

        return response()->json([
            'success' => true,
            'message' => 'Item berhasil dihapus dari keranjang',
            'data' => [
                'cart' => $cart,
            ],
        ]);
    }

    /**
     * Clear cart
     */
    public function clear(Request $request)
    {
        $cart = Cart::where('user_id', $request->user()->id)->first();

        if ($cart) {
            $cart->items()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Keranjang berhasil dikosongkan',
        ]);
    }
}
