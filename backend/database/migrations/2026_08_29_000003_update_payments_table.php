<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['invoice_id']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('invoice_id')->nullable()->change();
            $table->foreignId('order_id')->nullable()->after('invoice_id')->constrained('orders')->nullOnDelete();
            $table->string('payment_number')->nullable()->unique()->after('id');
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending')->after('payment_method');
            $table->string('transaction_id')->nullable()->after('reference');
            $table->timestamp('payment_date')->nullable()->after('transaction_id');
            $table->decimal('refund_amount', 15, 2)->nullable()->after('payment_date');
            $table->timestamp('refund_date')->nullable()->after('refund_amount');
            $table->softDeletes()->after('updated_at');

            $table->foreign('invoice_id')->references('id')->on('invoices')->nullOnDelete();
            $table->index('order_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['invoice_id']);
            $table->dropForeign(['order_id']);
            $table->dropUnique(['payment_number']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn([
                'order_id',
                'payment_number',
                'status',
                'transaction_id',
                'payment_date',
                'refund_amount',
                'refund_date',
                'deleted_at',
            ]);
            $table->foreignId('invoice_id')->nullable(false)->change();
            $table->foreign('invoice_id')->references('id')->on('invoices')->cascadeOnDelete();
        });
    }
};
