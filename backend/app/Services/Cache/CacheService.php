<?php

namespace App\Services\Cache;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

class CacheService
{
    protected $defaultTTL = 3600; // 1 hour

    /**
     * Get value from cache
     */
    public function get(string $key, $default = null)
    {
        return Cache::get($key, $default);
    }

    /**
     * Set value in cache
     */
    public function set(string $key, $value, int $ttl = null): bool
    {
        $ttl = $ttl ?? $this->defaultTTL;
        return Cache::put($key, $value, $ttl);
    }

    /**
     * Remember value in cache
     */
    public function remember(string $key, int $ttl, callable $callback)
    {
        return Cache::remember($key, $ttl, $callback);
    }

    /**
     * Delete value from cache
     */
    public function forget(string $key): bool
    {
        return Cache::forget($key);
    }

    /**
     * Clear all cache
     */
    public function flush(): bool
    {
        return Cache::flush();
    }

    /**
     * Cache product data
     */
    public function cacheProduct(int $productId, callable $callback, int $ttl = 7200)
    {
        return $this->remember("product:{$productId}", $ttl, $callback);
    }

    /**
     * Cache category data
     */
    public function cacheCategory(int $categoryId, callable $callback, int $ttl = 3600)
    {
        return $this->remember("category:{$categoryId}", $ttl, $callback);
    }

    /**
     * Cache user data
     */
    public function cacheUser(int $userId, callable $callback, int $ttl = 1800)
    {
        return $this->remember("user:{$userId}", $ttl, $callback);
    }

    /**
     * Cache dashboard stats
     */
    public function cacheDashboardStats(string $type, callable $callback, int $ttl = 300)
    {
        return $this->remember("dashboard:{$type}:stats", $ttl, $callback);
    }

    /**
     * Cache search results
     */
    public function cacheSearchResults(string $query, string $type, callable $callback, int $ttl = 600)
    {
        return $this->remember("search:{$type}:" . md5($query), $ttl, $callback);
    }

    /**
     * Invalidate product cache
     */
    public function invalidateProductCache(int $productId): void
    {
        $this->forget("product:{$productId}");
        $this->forget("product:{$productId}:details");
    }

    /**
     * Invalidate category cache
     */
    public function invalidateCategoryCache(int $categoryId): void
    {
        $this->forget("category:{$categoryId}");
        $this->forget("category:{$categoryId}:products");
    }

    /**
     * Invalidate user cache
     */
    public function invalidateUserCache(int $userId): void
    {
        $this->forget("user:{$userId}");
        $this->forget("user:{$userId}:profile");
    }

    /**
     * Get cache statistics
     */
    public function getStats(): array
    {
        if (Cache::getStore() instanceof \Illuminate\Cache\Repository) {
            return [
                'driver' => config('cache.default'),
                'prefix' => config('cache.prefix'),
            ];
        }

        return [];
    }

    /**
     * Check if key exists in cache
     */
    public function has(string $key): bool
    {
        return Cache::has($key);
    }

    /**
     * Increment value in cache
     */
    public function increment(string $key, int $value = 1): int|bool
    {
        return Cache::increment($key, $value);
    }

    /**
     * Decrement value in cache
     */
    public function decrement(string $key, int $value = 1): int|bool
    {
        return Cache::decrement($key, $value);
    }

    /**
     * Add value to cache only if key doesn't exist
     */
    public function add(string $key, $value, int $ttl = null): bool
    {
        $ttl = $ttl ?? $this->defaultTTL;
        return Cache::add($key, $value, $ttl);
    }

    /**
     * Get multiple values from cache
     */
    public function many(array $keys): array
    {
        return Cache::many($keys);
    }

    /**
     * Set multiple values in cache
     */
    public function putMany(array $values, int $ttl = null): bool
    {
        $ttl = $ttl ?? $this->defaultTTL;
        return Cache::put($values, $ttl);
    }
}
