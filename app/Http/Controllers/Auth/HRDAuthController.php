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
        $credentials = $request->validate([
            'email'      => 'required|email',
            'kata_sandi' => 'required|string',
        ]);

        // Attempt login against the 'hrd' guard
        if (Auth::guard('hrd')->attempt([
            'email'    => $credentials['email'],
            'password' => $credentials['kata_sandi'],
        ], $request->boolean('remember'))) {

            $request->session()->regenerate();
            return redirect()->intended(route('hrd.dashboard'));
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
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
