<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InputSanitizationMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // Sanitasi input request
        $request->merge($this->sanitizeInput($request->all()));

        return $next($request);
    }

    protected function sanitizeInput(array $data): array
    {
        $sanitized = [];
        $excludedKeys = ['password', 'password_confirmation', 'content', 'description'];

        foreach ($data as $key => $value) {
            if (is_string($value)) {
                // Skip sanitization untuk field tertentu
                if (in_array($key, $excludedKeys)) {
                    $sanitized[$key] = $value;
                    continue;
                }

                // Hapus script tags
                $value = preg_replace('/<script\b[^>]*(?:(?!<\/script>)<[^>]*)*<\/script>/i', '', $value);

                // Hapus iframe tags
                $value = preg_replace('/<iframe\b[^>]*(?:(?!<\/iframe>)<[^>]*)*<\/iframe>/i', '', $value);

                // Hapus event handlers
                $value = preg_replace('/\s*on\w+\s*=\s*["\'][^"\']*["\']/i', '', $value);

                // Hapus javascript: protocol
                $value = preg_replace('/javascript\s*:/i', '', $value);

                // Hapus vbscript: protocol
                $value = preg_replace('/vbscript\s*:/i', '', $value);

                // Trim whitespace
                $value = trim($value);

                $sanitized[$key] = $value;
            } elseif (is_array($value)) {
                $sanitized[$key] = $this->sanitizeInput($value);
            } else {
                $sanitized[$key] = $value;
            }
        }

        return $sanitized;
    }
}
