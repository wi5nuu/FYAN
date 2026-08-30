<?php

namespace App\Services\Report;

use App\Models\Order;
use App\Models\Product;
use App\Models\Invoice;
use Carbon\Carbon;

class ReportService
{
    public function getSalesReport($startDate, $endDate)
    {
        $orders = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', '!=', 'cancelled')
            ->get();

        return [
            'total_orders' => $orders->count(),
            'total_revenue' => $orders->sum('total_amount'),
            'average_order_value' => $orders->avg('total_amount'),
            'total_items_sold' => $orders->sum('total_items'),
        ];
    }

    public function getProductPerformance($startDate, $endDate)
    {
        return Product::with('orderItems')
            ->withCount(['orderItems' => function($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }])
            ->orderBy('order_items_count', 'desc')
            ->limit(20)
            ->get();
    }

    public function getInventoryReport()
    {
        return [
            'total_products' => Product::count(),
            'total_value' => Product::sum(\DB::raw('stock_quantity * cost_price')),
            'low_stock_items' => Product::whereColumn('stock_quantity', '<=', 'min_stock')->count(),
            'out_of_stock' => Product::where('stock_quantity', 0)->count(),
        ];
    }

    public function getFinancialReport($startDate, $endDate)
    {
        $orders = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->get();

        $invoices = Invoice::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'paid')
            ->get();

        return [
            'total_revenue' => $orders->sum('total_amount'),
            'total_invoices' => $invoices->sum('total_amount'),
            'total_transactions' => $orders->count() + $invoices->count(),
        ];
    }

    public function getCustomerReport()
    {
        // Implementasi laporan customer
        return [];
    }
}
