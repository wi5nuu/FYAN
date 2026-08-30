<?php

namespace App\Services\Security;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

class SecurityService
{
    protected $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    /**
     * Generate JWT Token
     */
    public function generateJwtToken(array $payload, int $ttl = 3600): string
    {
        $secret = config('app.jwt_secret', env('JWT_SECRET'));
        $payload['iat'] = time();
        $payload['exp'] = time() + $ttl;
        $payload['jti'] = Str::random(32);

        return $this->encodeJwt($payload, $secret);
    }

    /**
     * Validate JWT Token
     */
    public function validateJwtToken(string $token): ?array
    {
        try {
            $secret = config('app.jwt_secret', env('JWT_SECRET'));
            $payload = $this->decodeJwt($token, $secret);

            if ($payload['exp'] < time()) {
                return null;
            }

            return $payload;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Encode JWT
     */
    protected function encodeJwt(array $payload, string $secret): string
    {
        $header = $this->base64UrlEncode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        $payload = $this->base64UrlEncode(json_encode($payload));
        $signature = $this->base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", $secret, true)
        );

        return "$header.$payload.$signature";
    }

    /**
     * Decode JWT
     */
    protected function decodeJwt(string $token, string $secret): array
    {
        [$header, $payload, $signature] = explode('.', $token);

        $expectedSignature = $this->base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", $secret, true)
        );

        if (!hash_equals($expectedSignature, $signature)) {
            throw new \Exception('Invalid JWT signature');
        }

        return json_decode($this->base64UrlDecode($payload), true);
    }

    /**
     * Base64 URL Encode
     */
    protected function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Base64 URL Decode
     */
    protected function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    /**
     * Generate 2FA Secret
     */
    public function generate2FASecret(string $email): array
    {
        $secret = $this->google2fa->generateSecretKey();
        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $email,
            $secret
        );

        return [
            'secret' => $secret,
            'qr_code_url' => $qrCodeUrl,
            'recovery_codes' => $this->generateRecoveryCodes(),
        ];
    }

    /**
     * Verify 2FA Code
     */
    public function verify2FACode(string $secret, string $code): bool
    {
        return $this->google2fa->verifyKey($secret, $code);
    }

    /**
     * Generate Recovery Codes
     */
    protected function generateRecoveryCodes(int $count = 8): array
    {
        $codes = [];
        for ($i = 0; $i < $count; $i++) {
            $codes[] = strtoupper(Str::random(4) . '-' . Str::random(4));
        }
        return $codes;
    }

    /**
     * Hash Password
     */
    public function hashPassword(string $password): string
    {
        return Hash::make($password);
    }

    /**
     * Verify Password
     */
    public function verifyPassword(string $password, string $hashedPassword): bool
    {
        return Hash::check($password, $hashedPassword);
    }

    /**
     * Generate API Key
     */
    public function generateApiKey(): string
    {
        return strtoupper(Str::random(32));
    }

    /**
     * Generate CSRF Token
     */
    public function generateCSRFToken(): string
    {
        return bin2hex(random_bytes(32));
    }

    /**
     * Validate CSRF Token
     */
    public function validateCSRFToken(string $token, string $sessionToken): bool
    {
        return hash_equals($sessionToken, $token);
    }

    /**
     * Encrypt Data
     */
    public function encrypt(string $data): string
    {
        return Crypt::encryptString($data);
    }

    /**
     * Decrypt Data
     */
    public function decrypt(string $encryptedData): string
    {
        return Crypt::decryptString($encryptedData);
    }

    /**
     * Generate Random Token
     */
    public function generateToken(int $length = 64): string
    {
        return bin2hex(random_bytes($length / 2));
    }

    /**
     * Hash Token for Storage
     */
    public function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }

    /**
     * Generate Password Reset Token
     */
    public function generatePasswordResetToken(): array
    {
        $token = $this->generateToken(64);
        $hashedToken = $this->hashToken($token);

        return [
            'token' => $token,
            'hashed_token' => $hashedToken,
            'expires_at' => now()->addHours(24),
        ];
    }
}
