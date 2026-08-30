<?php

namespace App\Http\Controllers\Api\V1\Ecommerce;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Services\Cache\CacheService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    protected $cacheService;

    public function __construct(CacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    /**
     * Get all products
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand'])
            ->active()
            ->forEcommerce();

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by brand
        if ($request->has('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filter by stock
        if ($request->has('in_stock') && $request->in_stock) {
            $query->inStock();
        }

        // Sort
        $sortField = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Paginate
        $perPage = $request->get('per_page', 15);
        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Get single product
     */
    public function show(string $slug)
    {
        $product = $this->cacheService->remember(
            "product:slug:{$slug}",
            7200,
            fn() => Product::with(['category', 'brand', 'reviews.user'])
                ->where('slug', $slug)
                ->active()
                ->firstOrFail()
        );

        return response()->json([
            'success' => true,
            'data' => [
                'product' => $product,
            ],
        ]);
    }

    /**
     * Get featured products
     */
    public function featured()
    {
        $products = $this->cacheService->remember('featured:products', 3600, function () {
            return Product::with(['category', 'brand'])
                ->active()
                ->forEcommerce()
                ->featured()
                ->inStock()
                ->limit(12)
                ->get();
        });

        return response()->json([
            'success' => true,
            'data' => [
                'products' => $products,
            ],
        ]);
    }

    /**
     * Get products by category
     */
    public function byCategory(string $categorySlug)
    {
        $category = Category::where('slug', $categorySlug)
            ->active()
            ->forEcommerce()
            ->firstOrFail();

        $products = Product::with(['category', 'brand'])
            ->active()
            ->forEcommerce()
            ->where('category_id', $category->id)
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => [
                'category' => $category,
                'products' => $products,
            ],
        ]);
    }

    /**
     * Search products
     */
    public function search(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:2',
        ]);

        $query = $request->q;

        $products = $this->cacheService->cacheSearchResults($query, 'products', function () use ($query) {
            return Product::with(['category', 'brand'])
                ->active()
                ->forEcommerce()
                ->where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                      ->orWhere('description', 'like', "%{$query}%")
                      ->orWhere('sku', 'like', "%{$query}%");
                })
                ->limit(20)
                ->get();
        });

        return response()->json([
            'success' => true,
            'data' => [
                'products' => $products,
                'query' => $query,
            ],
        ]);
    }

    /**
     * Get product reviews
     */
    public function reviews(string $slug)
    {
        $product = Product::where('slug', $slug)->active()->firstOrFail();

        $reviews = $product->with(['reviews.user'])
            ->reviews()
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => [
                'reviews' => $reviews,
            ],
        ]);
    }
}
