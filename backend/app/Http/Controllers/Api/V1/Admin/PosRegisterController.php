<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\PosRegister;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PosRegisterController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $registers = PosRegister::orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => [
                'registers' => $registers,
            ],
        ]);
    }

    public function open(Request $request, int $id): JsonResponse
    {
        $register = PosRegister::findOrFail($id);

        if ($register->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Kasir sudah aktif',
            ], 422);
        }

        $register->update([
            'is_active' => true,
            'opening_balance' => $request->get('opening_balance', 0),
            'opened_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kasir berhasil dibuka',
            'data' => [
                'register' => $register,
            ],
        ]);
    }

    public function close(int $id): JsonResponse
    {
        $register = PosRegister::findOrFail($id);

        if (!$register->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Kasir sudah tertutup',
            ], 422);
        }

        $register->update([
            'is_active' => false,
            'closed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kasir berhasil ditutup',
            'data' => [
                'register' => $register,
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $register = PosRegister::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'register' => $register,
            ],
        ]);
    }
}