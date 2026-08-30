# Quick Start Guide - Fiyan Project

## Prerequisites

Pastikan Anda sudah menginstall:
1. **XAMPP** (Apache + MySQL)
2. **PHP 8.3+** (sudah termasuk di XAMPP)
3. **Node.js 18+** (https://nodejs.org)
4. **Composer** (https://getcomposer.org)
5. **Git** (https://git-scm.com)

## Step 1: Setup Database

1. Buka **XAMPP Control Panel**
2. Start **Apache** dan **MySQL**
3. Buka **phpMyAdmin** (http://localhost/phpmyadmin)
4. Buat database baru dengan nama `fiyan_project`

## Step 2: Setup Backend

```bash
# Navigate to backend folder
cd project-fiyan/backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Edit .env file - pastikan database config benar:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=fiyan_project
# DB_USERNAME=root
# DB_PASSWORD=

# Run database migration
php artisan migrate

# Seed database with default data
php artisan db:seed

# Start Laravel development server
php artisan serve
```

Backend akan berjalan di: http://localhost:8000

## Step 3: Setup Frontend

```bash
# Open new terminal/command prompt
cd project-fiyan/frontend

# Install Node.js dependencies
npm install

# Start Next.js development server
npm run dev
```

Frontend akan berjalan di: http://localhost:3000

## Step 4: Test Aplikasi

### Login dengan Akun Demo:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@fiyanproject.com | password |
| Admin | admin2@fiyanproject.com | password |
| Kasir | kasir@fiyanproject.com | password |
| Editor | editor@fiyanproject.com | password |

### Akses Aplikasi:

1. **Homepage**: http://localhost:3000
2. **Login**: http://localhost:3000/login
3. **Dashboard**: http://localhost:3000/dashboard

## Step 5: API Testing

### Test API dengan Postman atau cURL:

```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","password_confirmation":"password123"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fiyanproject.com","password":"password"}'

# Get Products (with token)
curl http://localhost:8000/api/v1/ecommerce/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### Masalah Umum:

1. **Database Connection Error**
   - Pastikan MySQL sudah running di XAMPP
   - Cek konfigurasi database di file `.env`

2. **Migration Error**
   - Pastikan database `fiyan_project` sudah dibuat
   - Jalankan `php artisan migrate:fresh` untuk reset

3. **Composer Not Found**
   - Install Composer dari https://getcomposer.org
   - Pastikan Composer sudah di PATH

4. **Node Modules Error**
   - Hapus folder `node_modules`
   - Jalankan `npm install` lagi

5. **Port Already in Use**
   - Backend: `php artisan serve --port=8001`
   - Frontend: `npm run dev -- -p 3001`

## Next Steps

Setelah setup berhasil, Anda bisa:

1. **Mengembangkan Fitur Baru**
   - Tambah Controller baru
   - Tambah Model baru
   - Tambah Migration baru

2. **Kustomisasi**
   - Edit warna tema di `tailwind.config.js`
   - Edit layout di `frontend/src/app/layout.tsx`
   - Edit API routes di `backend/routes/api.php`

3. **Deploy ke Production**
   - Setup VPS/Cloud Server
   - Install PHP, MySQL, Node.js
   - Jalankan `npm run build` untuk frontend
   - Jalankan `php artisan optimize` untuk backend

## Documentation

Lihat dokumentasi lengkap di: `docs/README.md`
