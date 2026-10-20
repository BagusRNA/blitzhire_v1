<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Pelamar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class PelamarAuthController extends Controller
{
    /**
     * Show the Pelamar login form.
     */
    public function showLogin()
    {
        return Inertia::render('Auth/Pelamar/Login', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle Pelamar login request.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'      => 'required|email',
            'kata_sandi' => 'required|string',
        ]);

        if (Auth::guard('pelamar')->attempt([
            'email'    => $credentials['email'],
            'password' => $credentials['kata_sandi'],
        ], $request->boolean('remember'))) {

            $request->session()->regenerate();
            return redirect()->intended(route('pelamar.dashboard'));
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    /**
     * Show the Pelamar registration form.
     */
    public function showRegister()
    {
        return Inertia::render('Auth/Pelamar/Register');
    }

    /**
     * Handle Pelamar registration.
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'nama_lengkap'         => 'required|string|max:100',
            'email'                => 'required|email|max:100|unique:pelamar,email',
            'kata_sandi'           => 'required|string|min:8|confirmed',
            'nomor_hp'             => 'required|string|max:20',
            'alamat'               => 'required|string|max:255',
            'pendidikan_terakhir'  => 'required|string|max:100',
        ]);

        $pelamar = Pelamar::create([
            'nama_lengkap'        => $data['nama_lengkap'],
            'email'               => $data['email'],
            'kata_sandi'          => Hash::make($data['kata_sandi']),
            'nomor_hp'            => $data['nomor_hp'],
            'alamat'              => $data['alamat'],
            'pendidikan_terakhir' => $data['pendidikan_terakhir'],
        ]);

        Auth::guard('pelamar')->login($pelamar);

        return redirect()->route('pelamar.dashboard');
    }

    /**
     * Handle Pelamar logout.
     */
    public function logout(Request $request)
    {
        Auth::guard('pelamar')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }
}
