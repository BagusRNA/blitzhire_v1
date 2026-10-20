<?php

use App\Http\Controllers\Auth\HRDAuthController;
use App\Http\Controllers\Auth\PelamarAuthController;
// Default Breeze controllers kept for password reset flow
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use Illuminate\Support\Facades\Route;

// ─── HRD Auth ──────────────────────────────────────────────
Route::prefix('hrd-login')->name('hrd.auth.')->group(function () {
    Route::middleware('guest:hrd')->group(function () {
        Route::get('/', [HRDAuthController::class, 'showLogin'])->name('showLogin');
        Route::post('/', [HRDAuthController::class, 'login'])->name('login');
    });

    Route::middleware('auth:hrd')->group(function () {
        Route::post('logout', [HRDAuthController::class, 'logout'])->name('logout');
    });
});

// ─── Pelamar Auth ──────────────────────────────────────────
Route::prefix('kandidat')->name('pelamar.auth.')->group(function () {
    Route::middleware('guest:pelamar')->group(function () {
        Route::get('login', [PelamarAuthController::class, 'showLogin'])->name('showLogin');
        Route::post('login', [PelamarAuthController::class, 'login'])->name('login');
        Route::get('register', [PelamarAuthController::class, 'showRegister'])->name('showRegister');
        Route::post('register', [PelamarAuthController::class, 'register'])->name('register');
    });

    Route::middleware('auth:pelamar')->group(function () {
        Route::post('logout', [PelamarAuthController::class, 'logout'])->name('logout');
    });
});

// ─── Password Reset (shared, uses default users table) ─────
// Note: For custom guard password resets, further customisation is needed.
Route::middleware('guest')->group(function () {
    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('password.request');
    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
        ->name('password.email');
    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
        ->name('password.reset');
    Route::post('reset-password', [NewPasswordController::class, 'store'])
        ->name('password.store');
});
