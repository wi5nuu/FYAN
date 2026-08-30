<?php

namespace App\Services\Email;

use Illuminate\Support\Facades\Mail;

class EmailService
{
    public function sendWelcomeEmail($user)
    {
        // Implementasi email selamat datang
        return true;
    }

    public function sendOrderConfirmationEmail($order)
    {
        // Implementasi email konfirmasi order
        return true;
    }

    public function sendInvoiceEmail($invoice)
    {
        // Implementasi email invoice
        return true;
    }

    public function sendPasswordResetEmail($user, $token)
    {
        // Implementasi email reset password
        return true;
    }

    public function sendOrderStatusUpdate($order)
    {
        // Implementasi email update status order
        return true;
    }

    public function sendLowStockAlert($product)
    {
        // Implementasi email alert stok rendah
        return true;
    }
}
