# Fiyan Project - E-Commerce, POS, ERP & CMS

Sistem Terintegrasi untuk mengelola bisnis dengan fitur E-Commerce, Point of Sale, Enterprise Resource Planning, dan Content Management System dalam satu platform.

## Tech Stack

### Backend
- **Framework**: Laravel 11
- **PHP Version**: 8.3
- **Database**: MySQL 8.0
- **Cache**: Redis / File Cache
- **Authentication**: Laravel Sanctum + JWT
- **Queue**: Database / Redis

### Frontend
- **Framework**: Next.js 14 (React 18)
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Validation**: Zod

## Fitur Utama

### 1. E-Commerce
- Manajemen Produk (CRUD, Variasi, Stok)
- Kategori & Merek
- Keranjang Belanja
- Checkout & Pembayaran
- Manajemen Pesanan
- Review & Rating Produk
- Pencarian & Filter Produk

### 2. Point of Sale (POS)
- Transaksi Kasir
- Multiple Payment Methods
- Cetak Struk
- Manajemen Kas
- Laporan Penjualan Harian
- Barcode Scanner Support

### 3. Enterprise Resource Planning (ERP)
- Manajemen Invoice (Sales & Purchase)
- Purchase Order
- Manajemen Stok & Inventory
- Pelacakan Pergerakan Stok
- Manajemen Supplier
- Laporan Keuangan

### 4. Content Management System (CMS)
- Manajemen Halaman
- Blog & Artikel
- Kategori & Tag
- Komentar
- Menu Management
- Media Library
- SEO Settings

## Security Features

### 1. Authentication & Authorization
- Laravel Sanctum (Token-based Auth)
- Two-Factor Authentication (2FA)
- Role-Based Access Control (RBAC)
- JWT Token

### 2. Security Headers
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Strict Transport Security (HSTS)
- Referrer-Policy

### 3. Rate Limiting
- Login Attempt Limiting
- API Rate Limiting
- Brute Force Protection

### 4. Input Sanitization
- XSS Prevention
- SQL Injection Prevention
- CSRF Protection
- Input Validation

### 5. Data Encryption
- Password Hashing (bcrypt)
- Data Encryption
- Secure Session Management

## Caching Strategy

### 1. Cache Drivers
- **Development**: File Cache
- **Production**: Redis

### 2. Cached Data
- Product Data
- Category Data
- User Data
- Dashboard Statistics
- Search Results

### 3. Cache Invalidation
- Automatic on Data Update
- Manual Cache Clear
- Tag-based Invalidation

## Database Schema

### Core Tables
- `users` - User management
- `roles` & `permissions` - RBAC
- `categories` - Product categories
- `brands` - Product brands
- `suppliers` - Supplier management
- `products` - Product catalog

### E-Commerce Tables
- `orders` & `order_items` - Order management
- `carts` & `cart_items` - Shopping cart
- `wishlists` - User wishlists
- `reviews` - Product reviews

### POS Tables
- `pos_registers` - Cash register
- `pos_transactions` - POS transactions
- `pos_items` - Transaction items
- `pos_payments` - Payment records
- `pos_refunds` - Refund records

### ERP Tables
- `invoices` & `invoice_items` - Invoice management
- `payments` - Payment records
- `purchase_orders` & `purchase_order_items` - PO management
- `stock_movements` - Stock tracking

### CMS Tables
- `pages` & `page_revisions` - Page management
- `posts` - Blog posts
- `tags` & `post_tag` - Tagging system
- `comments` - Post comments
- `menus` & `menu_items` - Menu management
- `media` - Media library
- `settings` - Site settings

## Installation

### Prerequisites
- PHP 8.3+
- MySQL 8.0+
- Node.js 18+
- Redis (optional, for production)

### Backend Setup

```bash
# Clone repository
git clone https://github.com/your-repo/project-fiyan.git

# Navigate to backend
cd project-fiyan/backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fiyan_project
DB_USERNAME=root
DB_PASSWORD=

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Start development server
php artisan serve
```

### Frontend Setup

```bash
# Navigate to frontend
cd project-fiyan/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## API Documentation

### Authentication

#### Register
```
POST /api/v1/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

#### Login
```
POST /api/v1/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### E-Commerce API

#### Get Products
```
GET /api/v1/ecommerce/products
GET /api/v1/ecommerce/products?search=samsung
GET /api/v1/ecommerce/products?category_id=1
GET /api/v1/ecommerce/products?min_price=1000000&max_price=5000000
```

#### Get Single Product
```
GET /api/v1/ecommerce/products/{slug}
```

#### Cart Operations
```
GET /api/v1/ecommerce/cart
POST /api/v1/ecommerce/cart
{
  "product_id": 1,
  "quantity": 2
}
PUT /api/v1/ecommerce/cart/{itemId}
DELETE /api/v1/ecommerce/cart/{itemId}
```

#### Create Order
```
POST /api/v1/ecommerce/orders
{
  "shipping_address": {
    "street": "Jl. Sudirman No. 123",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "postal_code": "12345"
  },
  "payment_method": "bank_transfer",
  "notes": "Tolong packing aman"
}
```

### POS API

#### Create Transaction
```
POST /api/v1/pos/transactions
{
  "customer_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ],
  "payment_method": "cash",
  "payment_amount": 500000
}
```

### ERP API

#### Create Invoice
```
POST /api/v1/erp/invoices
{
  "customer_id": 1,
  "type": "sales",
  "due_date": "2024-12-31",
  "items": [
    {
      "description": "Product A",
      "quantity": 2,
      "unit_price": 1000000
    }
  ]
}
```

### CMS API

#### Create Page
```
POST /api/v1/cms/pages
{
  "title": "Tentang Kami",
  "content": "<p>Tentang kami content</p>",
  "meta_title": "Tentang Kami - Fiyan Project"
}
```

#### Create Post
```
POST /api/v1/cms/posts
{
  "title": "Tips Belanja Online",
  "content": "<p>Tips belanja online content</p>",
  "category_id": 1,
  "tags": ["tips", "belanja", "online"]
}
```

## Default User Accounts

### Super Admin
- Email: admin@fiyanproject.com
- Password: password

### Admin
- Email: admin2@fiyanproject.com
- Password: password

### Cashier
- Email: kasir@fiyanproject.com
- Password: password

### Editor
- Email: editor@fiyanproject.com
- Password: password

## Development

### Code Structure

```
project-fiyan/
├── backend/
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── Api/V1/
│   │   │   │       ├── Auth/
│   │   │   │       ├── Admin/
│   │   │   │       ├── Ecommerce/
│   │   │   │       ├── Pos/
│   │   │   │       ├── Erp/
│   │   │   │       └── Cms/
│   │   │   └── Middleware/
│   │   ├── Models/
│   │   ├── Services/
│   │   │   ├── Cache/
│   │   │   └── Security/
│   │   └── Traits/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
│       └── api.php
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── hooks/
│   │   └── types/
│   └── public/
└── docs/
```

### Coding Standards

1. **PSR-12** for PHP coding standard
2. **ESLint** for JavaScript/TypeScript
3. **Tailwind CSS** for styling
4. **Repository Pattern** for data access
5. **Service Layer** for business logic

## License

MIT License

## Support

For support, email support@fiyanproject.com or create an issue on GitHub.
