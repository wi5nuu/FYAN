<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Permissions
        $permissions = [
            // User Management
            'users.view', 'users.create', 'users.update', 'users.delete',
            'roles.view', 'roles.create', 'roles.update', 'roles.delete',
            'permissions.view', 'permissions.create', 'permissions.update', 'permissions.delete',

            // Product Management
            'products.view', 'products.create', 'products.update', 'products.delete',
            'categories.view', 'categories.create', 'categories.update', 'categories.delete',
            'brands.view', 'brands.create', 'brands.update', 'brands.delete',
            'suppliers.view', 'suppliers.create', 'suppliers.update', 'suppliers.delete',

            // E-Commerce
            'orders.view', 'orders.update', 'orders.cancel',
            'customers.view', 'customers.create', 'customers.update', 'customers.delete',
            'reviews.view', 'reviews.approve', 'reviews.delete',

            // POS
            'pos.view', 'pos.create', 'pos.refund',
            'pos_registers.view', 'pos_registers.create', 'pos_registers.update',

            // ERP
            'invoices.view', 'invoices.create', 'invoices.update', 'invoices.delete', 'invoices.payment',
            'purchase_orders.view', 'purchase_orders.create', 'purchase_orders.update', 'purchase_orders.approve', 'purchase_orders.receive',
            'stock.view', 'stock.adjust',

            // CMS
            'pages.view', 'pages.create', 'pages.update', 'pages.delete', 'pages.publish',
            'posts.view', 'posts.create', 'posts.update', 'posts.delete', 'posts.publish',
            'menus.view', 'menus.create', 'menus.update', 'menus.delete',
            'media.view', 'media.upload', 'media.delete',
            'settings.view', 'settings.update',

            // Dashboard
            'dashboard.view', 'dashboard.reports',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        // Create Roles
        $roles = [
            'super-admin' => [
                'description' => 'Super Administrator dengan akses penuh',
                'permissions' => $permissions, // All permissions
            ],
            'admin' => [
                'description' => 'Administrator dengan akses penuh kecuali manajemen user',
                'permissions' => array_filter($permissions, fn($p) => !str_starts_with($p, 'users.') && !str_starts_with($p, 'roles.') && !str_starts_with($p, 'permissions.')),
            ],
            'manager' => [
                'description' => 'Manager dengan akses ke operasional',
                'permissions' => [
                    'products.view', 'products.create', 'products.update',
                    'categories.view', 'categories.create', 'categories.update',
                    'orders.view', 'orders.update',
                    'customers.view', 'customers.create', 'customers.update',
                    'pos.view', 'pos.create',
                    'invoices.view', 'invoices.create', 'invoices.payment',
                    'purchase_orders.view', 'purchase_orders.create',
                    'stock.view', 'stock.adjust',
                    'pages.view', 'pages.create', 'pages.update', 'pages.publish',
                    'posts.view', 'posts.create', 'posts.update', 'posts.publish',
                    'dashboard.view', 'dashboard.reports',
                ],
            ],
            'cashier' => [
                'description' => 'Kasir untuk transaksi POS',
                'permissions' => [
                    'pos.view', 'pos.create',
                    'products.view',
                    'customers.view',
                    'dashboard.view',
                ],
            ],
            'staff' => [
                'description' => 'Staff dengan akses terbatas',
                'permissions' => [
                    'products.view',
                    'orders.view',
                    'customers.view',
                    'pages.view', 'posts.view',
                ],
            ],
            'customer' => [
                'description' => 'Pelanggan E-Commerce',
                'permissions' => [],
            ],
            'editor' => [
                'description' => 'Editor CMS',
                'permissions' => [
                    'pages.view', 'pages.create', 'pages.update', 'pages.delete', 'pages.publish',
                    'posts.view', 'posts.create', 'posts.update', 'posts.delete', 'posts.publish',
                    'menus.view', 'menus.create', 'menus.update', 'menus.delete',
                    'media.view', 'media.upload', 'media.delete',
                    'reviews.view', 'reviews.approve',
                ],
            ],
        ];

        foreach ($roles as $roleName => $roleData) {
            $role = Role::firstOrCreate(
                ['name' => $roleName, 'guard_name' => 'web'],
                ['description' => $roleData['description']]
            );

            $role->syncPermissions($roleData['permissions']);
        }
    }
}
