<?php

namespace App\Http\Controllers\Api\V1\Ecommerce;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Product;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);

        $reviews = $product->reviews()
            ->with('user')
            ->where('is_approved', true)
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $reviews,
        ]);
    }

    public function store(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:1000',
            'title' => 'nullable|string|max:255',
        ]);

        $existingReview = Review::where('product_id', $productId)
            ->where('user_id', auth()->id())
            ->first();

        if ($existingReview) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah memberikan review untuk produk ini',
            ], 422);
        }

        $review = Review::create([
            'product_id' => $productId,
            'user_id' => auth()->id(),
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'title' => $validated['title'] ?? null,
            'is_approved' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Review berhasil dikirim dan menunggu persetujuan',
            'data' => $review->load('user'),
        ], 201);
    }

    public function update(Request $request, $reviewId)
    {
        $review = Review::findOrFail($reviewId);

        if ($review->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk mengubah review ini',
            ], 403);
        }

        $validated = $request->validate([
            'rating' => 'integer|min:1|max:5',
            'comment' => 'string|max:1000',
            'title' => 'nullable|string|max:255',
        ]);

        $review->update($validated);
        $review->update(['is_approved' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Review berhasil diperbarui dan menunggu persetujuan',
            'data' => $review,
        ]);
    }

    public function destroy($reviewId)
    {
        $review = Review::findOrFail($reviewId);

        if ($review->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk menghapus review ini',
            ], 403);
        }

        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Review berhasil dihapus',
        ]);
    }

    public function approve($reviewId)
    {
        $review = Review::findOrFail($reviewId);
        $review->update(['is_approved' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Review berhasil disetujui',
            'data' => $review,
        ]);
    }

    public function reject($reviewId)
    {
        $review = Review::findOrFail($reviewId);
        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Review berhasil ditolak dan dihapus',
        ]);
    }
}
