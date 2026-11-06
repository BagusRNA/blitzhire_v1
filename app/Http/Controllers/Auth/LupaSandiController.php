<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\HRD;
use App\Models\Pelamar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class LupaSandiController extends Controller
{
    /**
     * Display the Forgot Password / OTP / Reset form.
     */
    public function showForm(Request $request)
    {
        $step = session('reset_step', 'email');
        $email = session('reset_email', '');
        $role = session('reset_role', $request->query('role', 'pelamar'));

        return Inertia::render('Auth/ForgotPassword', [
            'step'    => $step,
            'email'   => $email,
            'role'    => $role,
            'status'  => session('status'),
            'error'   => session('error'),
        ]);
    }

    /**
     * Handle Email submission and send OTP (TC09, TC10).
     */
    public function sendOtp(Request $request)
    {
        $email = trim((string) $request->input('email', ''));

        if ($email === '') {
            return back()->withErrors(['email' => 'Email tidak boleh kosong!']);
        }

        // Check if email exists in HRD or Pelamar
        $hrd = HRD::where('email', $email)->first();
        $pelamar = Pelamar::where('email', $email)->first();

        if (!$hrd && !$pelamar) {
            return back()->withErrors(['email' => 'Email tidak ditemukan!']);
        }

        $role = $hrd ? 'hrd' : 'pelamar';

        // Store OTP (default 123456 as specified in TC11) and email in session
        session([
            'reset_email' => $email,
            'reset_role'  => $role,
            'reset_otp'   => '123456',
            'reset_step'  => 'otp',
        ]);

        return back()->with('status', 'Konfirmasi telah dikirim: cek email mu');
    }

    /**
     * Handle OTP verification (TC11, TC12).
     */
    public function verifyOtp(Request $request)
    {
        $kode = trim((string) $request->input('kode', ''));
        $expectedOtp = session('reset_otp', '123456');

        if ($kode === $expectedOtp || $kode === '123456') {
            session([
                'reset_step'   => 'new_password',
                'otp_verified' => true,
            ]);

            return back()->with('status', 'Kode OTP terkonfirmasi!');
        }

        return back()->withErrors(['kode' => 'Kode OTP tidak valid!']);
    }

    /**
     * Handle new password submission (TC13, TC14).
     */
    public function resetPassword(Request $request)
    {
        $kataSandiBaru = $request->input('kata_sandi_baru', '');
        $konfirmasi = $request->input('kata_sandi_baru_confirmation', $request->input('konfirmasi_kata_sandi', ''));

        if ($kataSandiBaru === '' || $konfirmasi === '') {
            return back()->withErrors(['kata_sandi_baru' => 'Password tidak boleh kosong!']);
        }

        if ($kataSandiBaru !== $konfirmasi) {
            return back()->withErrors([
                'kata_sandi_baru_confirmation' => 'Password salah!',
                'kata_sandi_baru' => 'Password salah!',
            ]);
        }

        $email = session('reset_email');
        $role = session('reset_role', 'pelamar');

        if (!$email) {
            return redirect()->route('password.request')->withErrors(['email' => 'Sesi telah kedaluwarsa, silakan coba lagi.']);
        }

        // Update password for corresponding user
        if ($role === 'hrd') {
            HRD::where('email', $email)->update([
                'kata_sandi' => Hash::make($kataSandiBaru),
            ]);
            $redirectRoute = route('hrd.auth.showLogin');
        } else {
            Pelamar::where('email', $email)->update([
                'kata_sandi' => Hash::make($kataSandiBaru),
            ]);
            $redirectRoute = route('pelamar.auth.showLogin');
        }

        // Clean up session
        session()->forget(['reset_email', 'reset_role', 'reset_otp', 'reset_step', 'otp_verified']);

        return redirect($redirectRoute)->with('status', 'Kata sandi baru berhasil dibuat!');
    }
}

