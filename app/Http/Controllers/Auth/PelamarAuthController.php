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

        if (Auth::guard('pelamar')->attempt([
            'email'    => $email,
            'password' => $password,
        ], $request->boolean('remember'))) {

            $request->session()->regenerate();
            return redirect()->intended(route('pelamar.dashboard'));
        }

        return back()->withErrors([
            'email' => 'Email atau password tidak sesuai!',
            'kata_sandi' => 'Email atau password tidak sesuai!',
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
        $fields = [
            'nama_lengkap'            => $request->input('nama_lengkap', ''),
            'email'                   => $request->input('email', ''),
            'kata_sandi'              => $request->input('kata_sandi', ''),
            'kata_sandi_confirmation' => $request->input('kata_sandi_confirmation', ''),
            'nomor_hp'                => $request->input('nomor_hp', ''),
            'alamat'                  => $request->input('alamat', ''),
            'pendidikan_terakhir'     => $request->input('pendidikan_terakhir', ''),
        ];

        // TC23, TC24, TC25, TC26: check if any required field is empty
        foreach ($fields as $key => $val) {
            if (trim((string)$val) === '') {
                return back()->withErrors([$key => 'Semua field harus diisi!'])->withInput();
            }
        }

        // TC27: Strict email validation (reject pelamar@gmail.om or invalid domain extensions)
        $email = trim((string)$request->input('email', ''));
        $validDomainRegex = '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|id|co\.id|org|net|edu|gov|io|ac\.id)$/i';
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match($validDomainRegex, $email)) {
            return back()->withErrors(['email' => 'Email tidak valid!'])->withInput();
        }

        if (Pelamar::where('email', $email)->exists()) {
            return back()->withErrors(['email' => 'Email sudah terdaftar!'])->withInput();
        }

        // TC28: Check confirm password mismatch
        if ($request->input('kata_sandi') !== $request->input('kata_sandi_confirmation')) {
            return back()->withErrors([
                'kata_sandi_confirmation' => 'Password salah!',
                'kata_sandi' => 'Password salah!',
            ])->withInput();
        }

        Pelamar::create([
            'nama_lengkap'        => $fields['nama_lengkap'],
            'email'               => $email,
            'kata_sandi'          => Hash::make($fields['kata_sandi']),
            'nomor_hp'            => $fields['nomor_hp'],
            'alamat'              => $fields['alamat'],
            'pendidikan_terakhir' => $fields['pendidikan_terakhir'],
        ]);

        // TC22: Redirect to login with success pop-up "Akun berhasil dibuat!"
        return redirect()->route('pelamar.auth.showLogin')->with('status', 'Akun berhasil dibuat!');
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
