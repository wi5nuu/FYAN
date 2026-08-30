<?php

namespace App\Services\Notification;

use App\Models\User;
use Illuminate\Support\Facades\Notification;

class NotificationService
{
    public function sendOrderConfirmation($order)
    {
        // Implementasi notifikasi order
        return true;
    }

    public function sendPaymentConfirmation($payment)
    {
        // Implementasi notifikasi payment
        return true;
    }

    public function sendLowStockAlert($product)
    {
        $admins = User::role('admin')->get();
        
        // Implementasi notifikasi low stock ke admin
        return true;
    }

    public function sendInvoiceReminder($invoice)
    {
        // Implementasi reminder invoice
        return true;
    }

    public function sendShipmentUpdate($shipment)
    {
        // Implementasi notifikasi shipment update
        return true;
    }

    public function notifyUser(User $user, string $message, string $type = 'info')
    {
        // Implementasi notifikasi ke user
        return true;
    }
}
