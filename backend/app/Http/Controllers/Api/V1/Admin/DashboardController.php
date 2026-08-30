<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\PosTransaction;
use App\Models\Invoice;
use App\Models\Post;
use App\Models\Customer;
use App\Services\Cache\CacheService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    protected $cacheService;

    public function __construct(CacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    /**
     * Get dashboard statistics
     */
    public function index(Request $request)
    {
        $stats = $this->cacheService->cacheDashboardStats('admin', function () {
            return [
                'users' => User::count(),
                'active_users' => User::where('is_active', true)->count(),
                'products' => Product::count(),
                'active_products' => Product::active()->count(),
                'low_stock_products' => Product::lowStock()->count(),
                'orders' => Order::count(),
                'pending_orders' => Order::byStatus('pending')->count(),
                'revenue' => Order::where('payment_status', 'paid')
                    ->whereMonth('created_at', now()->month)
                    ->sum('total_amount'),
                'pos_transactions' => PosTransaction::today()->count(),
                'pos_revenue' => PosTransaction::today()->sum('total_amount'),
                'invoices' => Invoice::count(),
                'overdue_invoices' => Invoice::overdue()->count(),
                'posts' => Post::count(),
                'published_posts' => Post::published()->count(),
                'customers' => Customer::count(),
            ];
        }, 300);

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
            ],
        ]);
    }

    /**
     * Get sales summary
     */
    public function salesSummary(Request $request)
    {
        $period = $request->get('period', 'monthly');

        $query = Order::where('payment_status', 'paid');

        if ($period === 'daily') {
            $query->whereDate('created_at', today());
        } elseif ($period === 'weekly') {
            $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
        } elseif ($period === 'monthly') {
            $query->whereMonth('created_at', now()->month)
                  ->whereYear('created_at', now()->year);
        } elseif ($period === 'yearly') {
            $query->whereYear('created_at', now()->year);
        }

        $summary = $query->selectRaw('
            COUNT(*) as total_orders,
            SUM(total_amount) as total_revenue,
            AVG(total_amount) as average_order_value,
            SUM(tax_amount) as total_tax
        ')->first();

        $posSummary = PosTransaction::today()
            ->selectRaw('
                COUNT(*) as total_transactions,
                SUM(total_amount) as total_revenue
            ')->first();

        return response()->json([
            'success' => true,
            'data' => [
                'ecommerce' => $summary,
                'pos' => $posSummary,
                'period' => $period,
            ],
        ]);
    }

    /**
     * Get recent orders
     */
    public function recentOrders()
    {
        $orders = Order::with(['user', 'items.product'])
            ->latest()
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'orders' => $orders,
            ],
        ]);
    }

    /**
     * Get low stock products
     */
    public function lowStockProducts()
    {
        $products = Product::with(['category', 'supplier'])
            ->lowStock()
            ->orderBy('stock_quantity', 'asc')
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'products' => $products,
            ],
        ]);
    }

    /**
     * Get revenue chart data
     */
    public function revenueChart(Request $request)
    {
        $days = $request->get('days', 30);

        $revenue = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', now()->subDays($days))
            ->selectRaw('DATE(created_at) as date, SUM(total_amount) as revenue')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $posRevenue = PosTransaction::where('created_at', '>=', now()->subDays($days))
            ->selectRaw('DATE(created_at) as date, SUM(total_amount) as revenue')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'ecommerce' => $revenue,
                'pos' => $posRevenue,
                'days' => $days,
            ],
        ]);
    }

    /**
     * Get top selling products
     */
    public function topProducts(Request $request)
    {
        $limit = $request->get('limit', 10);

        $products = Product::with(['category'])
            ->selectRaw('
                products.*,
                SUM(order_items.quantity) as total_sold,
                SUM(order_items.total) as total_revenue
            ')
            ->join('order_items', 'products.id', '=', 'order_items.product_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.payment_status', 'paid')
            ->groupBy('products.id')
            ->orderBy('total_sold', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'products' => $products,
            ],
        ]);
    }
}
