<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HRDAuthController extends Controller
{
    /**
     * Show the HRD login form.
     */
    public function showLogin()
    {
        return Inertia::render('Auth/HRD/Login', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle HRD login request.
     */
    public function login(Request $request)
    {
        $email = trim((string)$request->input('email', ''));
        $password = trim((string)$request->input('kata_sandi', ''));

        if ($email === '' && $password === '') {
            return back()->withErrors([
                'email' => 'Kredensial tidak boleh kosong!',
                'kata_sandi' => 'Kredensial tidak boleh kosong!',
            ])->onlyInput('email');
        }

        if ($email === '') {
            return back()->withErrors([
                'email' => 'Email tidak boleh kosong!',
            ])->onlyInput('email');
        }

        if ($password === '') {
            return back()->withErrors([
                'kata_sandi' => 'Password harus diisi!',
            ])->onlyInput('email');
        }

        // Attempt login against the 'hrd' guard
        if (Auth::guard('hrd')->attempt([
            'email'    => $email,
            'password' => $password,
        ], $request->boolean('remember'))) {

            $request->session()->regenerate();
            return redirect()->intended(route('hrd.dashboard'));
        }

        return back()->withErrors([
            'email' => 'Email atau password tidak sesuai!',
            'kata_sandi' => 'Email atau password tidak sesuai!',
        ])->onlyInput('email');
    }

    /**
     * Handle HRD logout.
     */
    public function logout(Request $request)
    {
        Auth::guard('hrd')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }
}
