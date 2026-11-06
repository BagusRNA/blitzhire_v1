<?php

use App\Http\Controllers\Auth\HRDAuthController;
use App\Http\Controllers\Auth\PelamarAuthController;
use App\Http\Controllers\Auth\LupaSandiController;
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

// ─── Password Reset / Lupa Sandi ───────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('forgot-password', [LupaSandiController::class, 'showForm'])->name('password.request');
    Route::post('forgot-password', [LupaSandiController::class, 'sendOtp'])->name('password.email');
    Route::post('forgot-password/verify-otp', [LupaSandiController::class, 'verifyOtp'])->name('password.verifyOtp');
    Route::post('forgot-password/reset', [LupaSandiController::class, 'resetPassword'])->name('password.resetPassword');
    Route::post('reset-password', [LupaSandiController::class, 'resetPassword'])->name('password.store');
});
