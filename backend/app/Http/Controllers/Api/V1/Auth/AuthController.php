<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Security\SecurityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected $securityService;

    public function __construct(SecurityService $securityService)
    {
        $this->securityService = $securityService;
    }

    /**
     * Register new user
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $this->securityService->hashPassword($validated['password']),
            'phone' => $validated['phone'] ?? null,
        ]);

        $user->assignRole('customer');

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil',
            'data' => [
                'user' => $user->load('roles:id,name'),
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !$this->securityService->verifyPassword($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial yang diberikan tidak valid.'],
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Akun Anda telah dinonaktifkan.'],
            ]);
        }

        // Check 2FA
        if ($user->two_factor_secret && !$user->two_factor_confirmed_at) {
            return response()->json([
                'success' => true,
                'message' => 'Verifikasi 2FA diperlukan',
                'data' => [
                    'requires_2fa' => true,
                    'email' => $user->email,
                ],
            ]);
        }

        $user->logLogin($request->ip());
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data' => [
                'user' => $user->load('roles:id,name'),
                'token' => $token,
            ],
        ]);
    }

    /**
     * Verify 2FA and complete login
     */
    public function verify2FA(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !$this->securityService->verify2FACode($user->two_factor_secret, $request->code)) {
            throw ValidationException::withMessages([
                'code' => ['Kode 2FA tidak valid.'],
            ]);
        }

        $user->logLogin($request->ip());
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Verifikasi 2FA berhasil',
            'data' => [
                'user' => $user->load('roles:id,name'),
                'token' => $token,
            ],
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil',
        ]);
    }

    /**
     * Get user profile
     */
    public function profile(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $request->user(),
            ],
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
        ]);

        $request->user()->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui',
            'data' => [
                'user' => $request->user(),
            ],
        ]);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if (!$this->securityService->verifyPassword($request->current_password, $request->user()->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password saat ini tidak valid.'],
            ]);
        }

        $request->user()->update([
            'password' => $this->securityService->hashPassword($request->password),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diubah',
        ]);
    }

    /**
     * Setup 2FA
     */
    public function setup2FA(Request $request)
    {
        $user = $request->user();
        $setup = $this->securityService->generate2FASecret($user->email);

        $user->update([
            'two_factor_secret' => $setup['secret'],
            'two_factor_recovery_codes' => json_encode($setup['recovery_codes']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Setup 2FA berhasil',
            'data' => [
                'qr_code_url' => $setup['qr_code_url'],
                'recovery_codes' => $setup['recovery_codes'],
            ],
        ]);
    }

    /**
     * Confirm 2FA setup
     */
    public function confirm2FA(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if (!$this->securityService->verify2FACode($user->two_factor_secret, $request->code)) {
            throw ValidationException::withMessages([
                'code' => ['Kode 2FA tidak valid.'],
            ]);
        }

        $user->update([
            'two_factor_confirmed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => '2FA berhasil dikonfirmasi',
        ]);
    }

    /**
     * Disable 2FA
     */
    public function disable2FA(Request $request)
    {
        $request->validate([
            'password' => 'required',
        ]);

        if (!$this->securityService->verifyPassword($request->password, $request->user()->password)) {
            throw ValidationException::withMessages([
                'password' => ['Password tidak valid.'],
            ]);
        }

        $request->user()->update([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => '2FA berhasil dinonaktifkan',
        ]);
    }
}
