<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pos_registers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('location')->nullable();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->decimal('opening_balance', 15, 2)->default(0);
            $table->decimal('closing_balance', 15, 2)->nullable();
            $table->timestamps();

            $table->index('is_active');
        });

        Schema::create('pos_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_number')->unique();
            $table->foreignId('cashier_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('register_id')->nullable()->constrained('pos_registers')->nullOnDelete();
            $table->enum('status', ['pending', 'completed', 'refunded', 'cancelled'])->default('pending');
            $table->string('payment_method', 50);
            $table->decimal('payment_amount', 15, 2);
            $table->decimal('change_amount', 15, 2)->default(0);
            $table->decimal('subtotal', 15, 2);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2);
            $table->string('currency', 3)->default('IDR');
            $table->text('notes')->nullable();
            $table->boolean('receipt_printed')->default(false);
            $table->timestamps();

            $table->index('transaction_number');
            $table->index('cashier_id');
            $table->index('customer_id');
            $table->index('register_id');
            $table->index('status');
            $table->index('created_at');
        });

        Schema::create('pos_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('pos_transactions')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->integer('quantity');
            $table->decimal('price', 15, 2);
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('total', 15, 2);
            $table->timestamps();

            $table->index('transaction_id');
            $table->index('product_id');
        });

        Schema::create('pos_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('pos_transactions')->cascadeOnDelete();
            $table->string('payment_method', 50);
            $table->decimal('amount', 15, 2);
            $table->string('reference')->nullable();
            $table->timestamps();

            $table->index('transaction_id');
        });

        Schema::create('pos_refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('pos_transactions')->cascadeOnDelete();
            $table->decimal('amount', 15, 2);
            $table->text('reason')->nullable();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->timestamps();

            $table->index('transaction_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pos_refunds');
        Schema::dropIfExists('pos_payments');
        Schema::dropIfExists('pos_items');
        Schema::dropIfExists('pos_transactions');
        Schema::dropIfExists('pos_registers');
    }
};
