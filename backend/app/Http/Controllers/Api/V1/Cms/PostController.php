<?php

namespace App\Http\Controllers\Api\V1\Cms;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PostController extends Controller
{
    /**
     * Get all posts
     */
    public function index(Request $request)
    {
        $query = Post::with(['author', 'category', 'tags']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            if (!$request->user() || !$request->user()->hasRole('admin')) {
                $query->published();
            }
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by tag
        if ($request->has('tag')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('name', $request->tag);
            });
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortField = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $posts = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data' => [
                'posts' => $posts,
            ],
        ]);
    }

    /**
     * Get single post
     */
    public function show(string $slug)
    {
        $post = Post::with(['author', 'category', 'tags', 'comments.user'])
            ->where('slug', $slug)
            ->published()
            ->firstOrFail();

        $post->incrementViews();

        return response()->json([
            'success' => true,
            'data' => [
                'post' => $post,
            ],
        ]);
    }

    /**
     * Create post
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'featured_image' => 'nullable|image|max:2048',
            'category_id' => 'required|exists:categories,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:100',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            'is_featured' => 'boolean',
        ]);

        $validated['author_id'] = $request->user()->id;
        $validated['slug'] = Str::slug($validated['title']);
        $validated['status'] = 'draft';

        $tags = $validated['tags'] ?? [];
        unset($validated['tags']);

        $post = Post::create($validated);

        // Attach tags
        foreach ($tags as $tagName) {
            $tag = Tag::firstOrCreate(
                ['name' => $tagName],
                ['slug' => Str::slug($tagName)]
            );
            $post->tags()->attach($tag);
        }

        $post->load(['author', 'category', 'tags']);

        return response()->json([
            'success' => true,
            'message' => 'Artikel berhasil dibuat',
            'data' => [
                'post' => $post,
            ],
        ], 201);
    }

    /**
     * Update post
     */
    public function update(Request $request, string $id)
    {
        $post = Post::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'excerpt' => 'nullable|string|max:500',
            'featured_image' => 'nullable|image|max:2048',
            'category_id' => 'sometimes|exists:categories,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:100',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            'is_featured' => 'boolean',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $post->title) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $tags = $validated['tags'] ?? null;
        unset($validated['tags']);

        $post->update($validated);

        // Update tags if provided
        if ($tags !== null) {
            $post->tags()->detach();
            foreach ($tags as $tagName) {
                $tag = Tag::firstOrCreate(
                    ['name' => $tagName],
                    ['slug' => Str::slug($tagName)]
                );
                $post->tags()->attach($tag);
            }
        }

        $post->load(['author', 'category', 'tags']);

        return response()->json([
            'success' => true,
            'message' => 'Artikel berhasil diperbarui',
            'data' => [
                'post' => $post,
            ],
        ]);
    }

    /**
     * Publish post
     */
    public function publish(string $id)
    {
        $post = Post::findOrFail($id);
        $post->publish();

        return response()->json([
            'success' => true,
            'message' => 'Artikel berhasil dipublikasikan',
        ]);
    }

    /**
     * Unpublish post
     */
    public function unpublish(string $id)
    {
        $post = Post::findOrFail($id);
        $post->unpublish();

        return response()->json([
            'success' => true,
            'message' => 'Artikel berhasil diarsipkan',
        ]);
    }

    /**
     * Delete post
     */
    public function destroy(string $id)
    {
        $post = Post::findOrFail($id);
        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Artikel berhasil dihapus',
        ]);
    }

    /**
     * Get popular posts
     */
    public function popular()
    {
        $posts = Post::with(['author', 'category'])
            ->published()
            ->popular(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'posts' => $posts,
            ],
        ]);
    }

    /**
     * Get featured posts
     */
    public function featured()
    {
        $posts = Post::with(['author', 'category'])
            ->published()
            ->featured()
            ->latest()
            ->limit(6)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'posts' => $posts,
            ],
        ]);
    }
}
