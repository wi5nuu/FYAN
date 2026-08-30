<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Ecommerce\ProductController;
use App\Http\Controllers\Api\V1\Ecommerce\CartController;
use App\Http\Controllers\Api\V1\Ecommerce\OrderController;
use App\Http\Controllers\Api\V1\Ecommerce\ReviewController;
use App\Http\Controllers\Api\V1\Ecommerce\WishlistController;
use App\Http\Controllers\Api\V1\Pos\PosController;
use App\Http\Controllers\Api\V1\Erp\InvoiceController;
use App\Http\Controllers\Api\V1\Erp\PurchaseOrderController;
use App\Http\Controllers\Api\V1\Cms\PageController;
use App\Http\Controllers\Api\V1\Cms\PostController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\ProductManagementController;
use App\Http\Controllers\Api\V1\Admin\CategoryController;
use App\Http\Controllers\Api\V1\Admin\BrandController;
use App\Http\Controllers\Api\V1\Admin\CustomerController;
use App\Http\Controllers\Api\V1\Admin\SupplierController;
use App\Http\Controllers\Api\V1\Admin\OrderManagementController;
use App\Http\Controllers\Api\V1\Admin\PosRegisterController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health Check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
    ]);
});

// Auth Routes (Public)
Route::prefix('v1/auth')->middleware(['throttle:10,1', 'sanitize'])->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/verify-2fa', [AuthController::class, 'verify2FA']);
});

// Public E-Commerce Routes
Route::prefix('v1/ecommerce')->group(function () {
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/featured', [ProductController::class, 'featured']);
    Route::get('/products/search', [ProductController::class, 'search']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);
    Route::get('/products/{slug}/reviews', [ProductController::class, 'reviews']);
    Route::get('/products/category/{slug}', [ProductController::class, 'byCategory']);
});

// Public CMS Routes
Route::prefix('v1/cms')->group(function () {
    Route::get('/pages', [PageController::class, 'index']);
    Route::get('/pages/{slug}', [PageController::class, 'show']);
    Route::get('/posts', [PostController::class, 'index']);
    Route::get('/posts/popular', [PostController::class, 'popular']);
    Route::get('/posts/featured', [PostController::class, 'featured']);
    Route::get('/posts/{slug}', [PostController::class, 'show']);
});

// Protected Routes
Route::prefix('v1')->middleware(['auth:sanctum', 'sanitize'])->group(function () {

    // Auth Routes
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/password', [AuthController::class, 'changePassword']);
        Route::post('/2fa/setup', [AuthController::class, 'setup2FA']);
        Route::post('/2fa/confirm', [AuthController::class, 'confirm2FA']);
        Route::post('/2fa/disable', [AuthController::class, 'disable2FA']);
    });

    // E-Commerce Routes (Authenticated)
    Route::prefix('ecommerce')->group(function () {
        // Cart
        Route::get('/cart', [CartController::class, 'index']);
        Route::post('/cart', [CartController::class, 'store']);
        Route::put('/cart/{itemId}', [CartController::class, 'update']);
        Route::delete('/cart/{itemId}', [CartController::class, 'destroy']);
        Route::delete('/cart', [CartController::class, 'clear']);

        // Orders
        Route::get('/orders', [OrderController::class, 'index']);
        Route::post('/orders', [OrderController::class, 'store']);
        Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
        Route::post('/orders/{orderNumber}/cancel', [OrderController::class, 'cancel']);

        // Reviews
        Route::get('/products/{productId}/reviews', [ReviewController::class, 'index']);
        Route::post('/products/{productId}/reviews', [ReviewController::class, 'store']);
        Route::put('/reviews/{reviewId}', [ReviewController::class, 'update']);
        Route::delete('/reviews/{reviewId}', [ReviewController::class, 'destroy']);

        // Wishlist
        Route::get('/wishlist', [WishlistController::class, 'index']);
        Route::post('/wishlist', [WishlistController::class, 'store']);
        Route::delete('/wishlist/{productId}', [WishlistController::class, 'destroy']);
        Route::delete('/wishlist', [WishlistController::class, 'clear']);
        Route::post('/wishlist/{productId}/move-to-cart', [WishlistController::class, 'moveToCart']);
    });

    // POS Routes
    Route::prefix('pos')->middleware(['role:super-admin|admin|manager|cashier'])->group(function () {
        Route::get('/transactions', [PosController::class, 'index']);
        Route::post('/transactions', [PosController::class, 'store']);
        Route::get('/transactions/{transactionNumber}', [PosController::class, 'show']);
        Route::get('/summary', [PosController::class, 'summary']);
        Route::get('/products', [PosController::class, 'products']);
    });

    // ERP Routes
    Route::prefix('erp')->middleware(['role:super-admin|admin|manager'])->group(function () {
        // Invoices
        Route::get('/invoices', [InvoiceController::class, 'index']);
        Route::get('/invoices/summary', [InvoiceController::class, 'summary']);
        Route::post('/invoices', [InvoiceController::class, 'store']);
        Route::get('/invoices/{invoiceNumber}', [InvoiceController::class, 'show']);
        Route::post('/invoices/{invoiceNumber}/payment', [InvoiceController::class, 'recordPayment']);

        // Purchase Orders
        Route::get('/purchase-orders', [PurchaseOrderController::class, 'index']);
        Route::post('/purchase-orders', [PurchaseOrderController::class, 'store']);
        Route::get('/purchase-orders/{poNumber}', [PurchaseOrderController::class, 'show']);
        Route::post('/purchase-orders/{poNumber}/approve', [PurchaseOrderController::class, 'approve']);
        Route::post('/purchase-orders/{poNumber}/receive', [PurchaseOrderController::class, 'receive']);
        Route::post('/purchase-orders/{poNumber}/cancel', [PurchaseOrderController::class, 'cancel']);
    });

    // CMS Routes (Authenticated)
    Route::prefix('cms')->middleware(['role:super-admin|admin|editor'])->group(function () {
        Route::post('/pages', [PageController::class, 'store']);
        Route::put('/pages/{id}', [PageController::class, 'update']);
        Route::post('/pages/{id}/publish', [PageController::class, 'publish']);
        Route::post('/pages/{id}/unpublish', [PageController::class, 'unpublish']);
        Route::delete('/pages/{id}', [PageController::class, 'destroy']);

        Route::post('/posts', [PostController::class, 'store']);
        Route::put('/posts/{id}', [PostController::class, 'update']);
        Route::post('/posts/{id}/publish', [PostController::class, 'publish']);
        Route::post('/posts/{id}/unpublish', [PostController::class, 'unpublish']);
        Route::delete('/posts/{id}', [PostController::class, 'destroy']);
    });

    // Admin Routes
    Route::prefix('admin')->middleware(['role:super-admin|admin|manager'])->group(function () {
        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/dashboard/sales-summary', [DashboardController::class, 'salesSummary']);
        Route::get('/dashboard/recent-orders', [DashboardController::class, 'recentOrders']);
        Route::get('/dashboard/low-stock', [DashboardController::class, 'lowStockProducts']);
        Route::get('/dashboard/revenue-chart', [DashboardController::class, 'revenueChart']);
        Route::get('/dashboard/top-products', [DashboardController::class, 'topProducts']);

        // Product Management
        Route::get('/products', [ProductManagementController::class, 'index']);
        Route::post('/products', [ProductManagementController::class, 'store']);
        Route::get('/products/{id}', [ProductManagementController::class, 'show']);
        Route::put('/products/{id}', [ProductManagementController::class, 'update']);
        Route::delete('/products/{id}', [ProductManagementController::class, 'destroy']);
        Route::post('/products/bulk-delete', [ProductManagementController::class, 'bulkDelete']);
        Route::put('/products/{id}/stock', [ProductManagementController::class, 'updateStock']);

        // Category Management
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::get('/categories/{id}', [CategoryController::class, 'show']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        // Brand Management
        Route::get('/brands', [BrandController::class, 'index']);
        Route::post('/brands', [BrandController::class, 'store']);
        Route::get('/brands/{id}', [BrandController::class, 'show']);
        Route::put('/brands/{id}', [BrandController::class, 'update']);
        Route::delete('/brands/{id}', [BrandController::class, 'destroy']);

        // Customer Management
        Route::get('/customers', [CustomerController::class, 'index']);
        Route::post('/customers', [CustomerController::class, 'store']);
        Route::get('/customers/{id}', [CustomerController::class, 'show']);
        Route::put('/customers/{id}', [CustomerController::class, 'update']);
        Route::delete('/customers/{id}', [CustomerController::class, 'destroy']);

        // Supplier Management
        Route::get('/suppliers', [SupplierController::class, 'index']);
        Route::post('/suppliers', [SupplierController::class, 'store']);
        Route::get('/suppliers/{id}', [SupplierController::class, 'show']);
        Route::put('/suppliers/{id}', [SupplierController::class, 'update']);
        Route::delete('/suppliers/{id}', [SupplierController::class, 'destroy']);

        // POS Register Management
        Route::get('/pos-registers', [PosRegisterController::class, 'index']);
        Route::get('/pos-registers/{id}', [PosRegisterController::class, 'show']);
        Route::post('/pos-registers/{id}/open', [PosRegisterController::class, 'open']);
        Route::post('/pos-registers/{id}/close', [PosRegisterController::class, 'close']);

        // Review Management
        Route::post('/reviews/{reviewId}/approve', [ReviewController::class, 'approve']);
        Route::post('/reviews/{reviewId}/reject', [ReviewController::class, 'reject']);

        // Order Management
        Route::get('/orders', [OrderManagementController::class, 'index']);
        Route::get('/orders/{orderNumber}', [OrderManagementController::class, 'show']);
        Route::put('/orders/{orderNumber}/status', [OrderManagementController::class, 'updateStatus']);
    });
});
