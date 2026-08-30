<?php

namespace App\Http\Controllers\Api\V1\Ecommerce;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index()
    {
        $wishlist = Wishlist::where('user_id', auth()->id())
            ->with('product.category', 'product.brand')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $wishlist,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        if (!$product->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak tersedia',
            ], 422);
        }

        $exists = Wishlist::where('user_id', auth()->id())
            ->where('product_id', $validated['product_id'])
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Produk sudah ada di wishlist',
            ], 422);
        }

        $wishlist = Wishlist::create([
            'user_id' => auth()->id(),
            'product_id' => $validated['product_id'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil ditambahkan ke wishlist',
            'data' => $wishlist->load('product'),
        ], 201);
    }

    public function destroy($productId)
    {
        $wishlist = Wishlist::where('user_id', auth()->id())
            ->where('product_id', $productId)
            ->first();

        if (!$wishlist) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak ditemukan di wishlist',
            ], 404);
        }

        $wishlist->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil dihapus dari wishlist',
        ]);
    }

    public function clear()
    {
        Wishlist::where('user_id', auth()->id())->delete();

        return response()->json([
            'success' => true,
            'message' => 'Wishlist berhasil dikosongkan',
        ]);
    }

    public function moveToCart(Request $request, $productId)
    {
        $wishlist = Wishlist::where('user_id', auth()->id())
            ->where('product_id', $productId)
            ->first();

        if (!$wishlist) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak ditemukan di wishlist',
            ], 404);
        }

        $product = Product::findOrFail($productId);

        if ($product->stock_quantity < 1) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak tersedia',
            ], 422);
        }

        $cart = auth()->user()->cart ?? auth()->user()->cart()->create();
        
        $cartItem = $cart->items()->where('product_id', $productId)->first();
        
        if ($cartItem) {
            $cartItem->increment('quantity');
        } else {
            $cart->items()->create([
                'product_id' => $productId,
                'quantity' => 1,
                'price' => $product->discount_price ?? $product->price,
            ]);
        }

        $wishlist->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil dipindahkan ke keranjang',
        ]);
    }
}
