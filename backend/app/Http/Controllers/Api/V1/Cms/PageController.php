<?php

namespace App\Http\Controllers\Api\V1\Cms;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PageController extends Controller
{
    /**
     * Get all pages
     */
    public function index(Request $request)
    {
        $query = Page::with(['author']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            // Default: only show published pages for public
            if (!$request->user() || !$request->user()->hasRole('admin')) {
                $query->published();
            }
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $pages = $query->orderBy('sort_order')
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => [
                'pages' => $pages,
            ],
        ]);
    }

    /**
     * Get single page
     */
    public function show(string $slug)
    {
        $page = Page::with(['author'])
            ->where('slug', $slug)
            ->published()
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => [
                'page' => $page,
            ],
        ]);
    }

    /**
     * Create page
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'featured_image' => 'nullable|image|max:2048',
            'template' => 'nullable|string|max:100',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
            'is_homepage' => 'boolean',
        ]);

        $validated['author_id'] = $request->user()->id;
        $validated['slug'] = Str::slug($validated['title']);
        $validated['status'] = 'draft';

        $page = Page::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Halaman berhasil dibuat',
            'data' => [
                'page' => $page,
            ],
        ], 201);
    }

    /**
     * Update page
     */
    public function update(Request $request, string $id)
    {
        $page = Page::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'excerpt' => 'nullable|string|max:500',
            'featured_image' => 'nullable|image|max:2048',
            'template' => 'nullable|string|max:100',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
            'is_homepage' => 'boolean',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $page->title) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $page->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Halaman berhasil diperbarui',
            'data' => [
                'page' => $page,
            ],
        ]);
    }

    /**
     * Publish page
     */
    public function publish(string $id)
    {
        $page = Page::findOrFail($id);
        $page->publish();

        return response()->json([
            'success' => true,
            'message' => 'Halaman berhasil dipublikasikan',
        ]);
    }

    /**
     * Unpublish page
     */
    public function unpublish(string $id)
    {
        $page = Page::findOrFail($id);
        $page->unpublish();

        return response()->json([
            'success' => true,
            'message' => 'Halaman berhasil diarsipkan',
        ]);
    }

    /**
     * Delete page
     */
    public function destroy(string $id)
    {
        $page = Page::findOrFail($id);
        $page->delete();

        return response()->json([
            'success' => true,
            'message' => 'Halaman berhasil dihapus',
        ]);
    }
}
