<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    public function index(Request $request)
    {
        $query = Brand::query();

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $brands = $query->withCount('products')
            ->orderBy('name')
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $brands,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:brands,slug',
            'description' => 'nullable|string',
            'logo' => 'nullable|string',
            'website' => 'nullable|url',
            'is_active' => 'boolean',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $brand = Brand::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Brand berhasil dibuat',
            'data' => $brand,
        ], 201);
    }

    public function show($id)
    {
        $brand = Brand::with('products')->withCount('products')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $brand,
        ]);
    }

    public function update(Request $request, $id)
    {
        $brand = Brand::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'slug' => 'string|unique:brands,slug,' . $id,
            'description' => 'nullable|string',
            'logo' => 'nullable|string',
            'website' => 'nullable|url',
            'is_active' => 'boolean',
        ]);

        $brand->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Brand berhasil diperbarui',
            'data' => $brand,
        ]);
    }

    public function destroy($id)
    {
        $brand = Brand::findOrFail($id);

        if ($brand->products()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Brand tidak dapat dihapus karena masih memiliki produk',
            ], 422);
        }

        $brand->delete();

        return response()->json([
            'success' => true,
            'message' => 'Brand berhasil dihapus',
        ]);
    }
}
