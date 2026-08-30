<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Supplier;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
        ]);

        // Create Super Admin
        $superAdmin = User::firstOrCreate(
            ['email' => 'admin@fiyanproject.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $superAdmin->assignRole('super-admin');

        // Create Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin2@fiyanproject.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole('admin');

        // Create Cashier
        $cashier = User::firstOrCreate(
            ['email' => 'kasir@fiyanproject.com'],
            [
                'name' => 'Kasir',
                'password' => Hash::make('password'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $cashier->assignRole('cashier');

        // Create Editor
        $editor = User::firstOrCreate(
            ['email' => 'editor@fiyanproject.com'],
            [
                'name' => 'Editor',
                'password' => Hash::make('password'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $editor->assignRole('editor');

        // Create Categories
        $categories = [
            ['name' => 'Elektronik', 'slug' => 'elektronik', 'type' => 'ecommerce'],
            ['name' => 'Fashion', 'slug' => 'fashion', 'type' => 'ecommerce'],
            ['name' => 'Makanan & Minuman', 'slug' => 'makanan-minuman', 'type' => 'ecommerce'],
            ['name' => 'Kesehatan', 'slug' => 'kesehatan', 'type' => 'ecommerce'],
            ['name' => 'Rumah & Dapur', 'slug' => 'rumah-dapur', 'type' => 'ecommerce'],
            ['name' => 'POS - Elektronik', 'slug' => 'pos-elektronik', 'type' => 'pos'],
            ['name' => 'POS - Fashion', 'slug' => 'pos-fashion', 'type' => 'pos'],
            ['name' => 'Blog', 'slug' => 'blog', 'type' => 'cms'],
            ['name' => 'Berita', 'slug' => 'berita', 'type' => 'cms'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }

        // Create Brands
        $brands = [
            ['name' => 'Samsung', 'slug' => 'samsung'],
            ['name' => 'Apple', 'slug' => 'apple'],
            ['name' => 'Xiaomi', 'slug' => 'xiaomi'],
            ['name' => 'Nike', 'slug' => 'nike'],
            ['name' => 'Adidas', 'slug' => 'adidas'],
        ];

        foreach ($brands as $brand) {
            Brand::firstOrCreate(
                ['slug' => $brand['slug']],
                $brand
            );
        }

        // Create Suppliers
        $suppliers = [
            [
                'name' => 'PT Tech Indonesia',
                'slug' => 'pt-tech-indonesia',
                'email' => 'info@techindonesia.com',
                'phone' => '021-1234567',
                'address' => 'Jl. Teknologi No. 1',
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
            ],
            [
                'name' => 'PT Fashion Jaya',
                'slug' => 'pt-fashion-jaya',
                'email' => 'info@fashionjaya.com',
                'phone' => '021-7654321',
                'address' => 'Jl. Fashion No. 10',
                'city' => 'Bandung',
                'province' => 'Jawa Barat',
            ],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::firstOrCreate(
                ['slug' => $supplier['slug']],
                $supplier
            );
        }

        // Create Sample Products
        $products = [
            [
                'name' => 'Samsung Galaxy S24',
                'slug' => 'samsung-galaxy-s24',
                'sku' => 'SAM-GALAXY-S24',
                'description' => 'Samsung Galaxy S24 Ultra 256GB',
                'price' => 19999000,
                'cost_price' => 17000000,
                'stock_quantity' => 50,
                'min_stock' => 10,
                'category_id' => 1,
                'brand_id' => 1,
                'supplier_id' => 1,
                'type' => 'ecommerce',
            ],
            [
                'name' => 'iPhone 15 Pro',
                'slug' => 'iphone-15-pro',
                'sku' => 'APPLE-IPHONE-15-PRO',
                'description' => 'iPhone 15 Pro 256GB',
                'price' => 21999000,
                'cost_price' => 19000000,
                'stock_quantity' => 30,
                'min_stock' => 5,
                'category_id' => 1,
                'brand_id' => 2,
                'supplier_id' => 1,
                'type' => 'ecommerce',
            ],
            [
                'name' => 'Nike Air Max 270',
                'slug' => 'nike-air-max-270',
                'sku' => 'NIKE-AIRMAX-270',
                'description' => 'Nike Air Max 270 Original',
                'price' => 1999000,
                'cost_price' => 1200000,
                'stock_quantity' => 100,
                'min_stock' => 20,
                'category_id' => 2,
                'brand_id' => 4,
                'supplier_id' => 2,
                'type' => 'ecommerce',
            ],
            [
                'name' => 'Kopi Arabica Premium',
                'slug' => 'kopi-arabica-premium',
                'sku' => 'KOPI-ARABICA-PREM',
                'description' => 'Kopi Arabica Premium 500gr',
                'price' => 125000,
                'cost_price' => 80000,
                'stock_quantity' => 200,
                'min_stock' => 50,
                'category_id' => 3,
                'supplier_id' => 1,
                'type' => 'ecommerce',
            ],
        ];

        foreach ($products as $product) {
            Product::firstOrCreate(
                ['slug' => $product['slug']],
                $product
            );
        }
    }
}
