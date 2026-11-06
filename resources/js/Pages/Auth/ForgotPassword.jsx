import React, { useState, useEffect } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';

export default function ForgotPassword({ status, step: initialStep = 'email', email: initialEmail = '', role = 'pelamar' }) {
    const [currentStep, setCurrentStep] = useState(initialStep);
    const [popupMessage, setPopupMessage] = useState(null);

    // Sync currentStep when props update
    useEffect(() => {
        if (initialStep) {
            setCurrentStep(initialStep);
        }
    }, [initialStep]);

    // Show popup if status indicates OTP confirmed or password created
    useEffect(() => {
        if (status) {
            if (status.includes('OTP terkonfirmasi') || status.includes('terkonfirmasi')) {
                setPopupMessage('Kode OTP terkonfirmasi!');
            }
        }
    }, [status]);

    // Form 1: Email
    const emailForm = useForm({
        email: initialEmail || '',
    });

    // Form 2: OTP
    const otpForm = useForm({
        kode: '',
    });

    // Form 3: New Password
    const passwordForm = useForm({
        kata_sandi_baru: '',
        konfirmasi_kata_sandi: '',
    });

    const submitEmail = (e) => {
        e.preventDefault();
        emailForm.post(route('password.email'), {
            preserveScroll: true,
            onSuccess: () => {
                // Controller sets session reset_step to 'otp'
            },
        });
    };

    const submitOtp = (e) => {
        e.preventDefault();
        otpForm.post(route('password.verifyOtp'), {
            preserveScroll: true,
            onSuccess: () => {
                // Controller sets session reset_step to 'new_password'
            },
        });
    };

    const submitPassword = (e) => {
        e.preventDefault();
        passwordForm.post(route('password.resetPassword'), {
            preserveScroll: true,
        });
    };

    const backLoginUrl = role === 'hrd' ? route('hrd.auth.showLogin') : route('pelamar.auth.showLogin');

    return (
        <div className="auth-standalone-page">
            <Head title="Lupa Kata Sandi - BlitzHire" />

            {/* Pop-up Alert Modal if any */}
            {popupMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center shadow-xl border border-gray-200">
                        <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                            ✓
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-2">Informasi</h3>
                        <p className="text-xs text-gray-600 mb-5">{popupMessage}</p>
                        <button
                            type="button"
                            onClick={() => setPopupMessage(null)}
                            className="w-full bg-black text-white font-bold text-xs py-2.5 rounded uppercase tracking-wider hover:bg-gray-800 transition"
                        >
                            Lanjutkan
                        </button>
                    </div>
                </div>
            )}

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <Link href="/" className="text-3xl font-black text-black tracking-tight uppercase">BlitzHire</Link>
                <h2 className="mt-4 text-xl font-bold text-black uppercase tracking-tight">Lupa Kata Sandi</h2>
                <p className="mt-2 text-xs text-gray-500 mb-6">
                    {currentStep === 'email' && 'Masukkan email terdaftar Anda untuk menerima kode OTP pemulihan kata sandi.'}
                    {currentStep === 'otp' && 'Masukkan 6 digit kode OTP yang telah dikirimkan ke email Anda.'}
                    {currentStep === 'new_password' && 'Buat kata sandi baru untuk akun Anda.'}
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="auth-standalone-card">

                    {/* Status Alert Banner */}
                    {status && (
                        <div className="mb-4 font-bold text-xs text-black bg-gray-100 border border-gray-800 p-3 rounded">
                            {status}
                        </div>
                    )}

                    {/* STEP 1: INPUT EMAIL (TC09, TC10) */}
                    {currentStep === 'email' && (
                        <form onSubmit={submitEmail} className="space-y-4" noValidate>
                            <div>
                                <label htmlFor="email" className="form-label-base">Email</label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={emailForm.data.email}
                                        placeholder="nama@email.com"
                                        className="auth-standalone-input"
                                        onChange={(e) => emailForm.setData('email', e.target.value)}
                                    />
                                </div>
                                {emailForm.errors.email && (
                                    <p className="text-red-600 font-bold text-xs mt-1">
                                        {emailForm.errors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={emailForm.processing}
                                    className="auth-standalone-btn w-full"
                                >
                                    {emailForm.processing ? 'Memproses...' : 'Kirim'}
                                </button>
                            </div>

                            <div className="text-center mt-4">
                                <Link href={backLoginUrl} className="text-xs font-bold text-black hover:underline uppercase tracking-wider">
                                    Kembali ke Login
                                </Link>
                            </div>
                        </form>
                    )}

                    {/* STEP 2: INPUT KODE OTP (TC11, TC12) */}
                    {currentStep === 'otp' && (
                        <form onSubmit={submitOtp} className="space-y-4" noValidate>
                            <div>
                                <label htmlFor="kode" className="form-label-base">Kode OTP</label>
                                <div className="mt-1">
                                    <input
                                        id="kode"
                                        type="text"
                                        name="kode"
                                        maxLength={6}
                                        value={otpForm.data.kode}
                                        placeholder="123456"
                                        className="auth-standalone-input tracking-widest text-center text-lg font-bold"
                                        onChange={(e) => otpForm.setData('kode', e.target.value)}
                                    />
                                </div>
                                {otpForm.errors.kode && (
                                    <p className="text-red-600 font-bold text-xs mt-1 text-center">
                                        {otpForm.errors.kode}
                                    </p>
                                )}
                                <p className="text-[11px] text-gray-500 mt-2 text-center">
                                    Gunakan kode <strong className="text-black font-mono">123456</strong> untuk pengujian.
                                </p>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={otpForm.processing}
                                    className="auth-standalone-btn w-full"
                                >
                                    {otpForm.processing ? 'Memverifikasi...' : 'Kirim'}
                                </button>
                            </div>

                            <div className="flex justify-between items-center text-xs mt-4">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep('email')}
                                    className="font-bold text-gray-600 hover:text-black hover:underline"
                                >
                                    ← Ubah Email
                                </button>
                                <Link href={backLoginUrl} className="font-bold text-black hover:underline uppercase tracking-wider">
                                    Kembali ke Login
                                </Link>
                            </div>
                        </form>
                    )}

                    {/* STEP 3: INPUT KATA SANDI BARU (TC13, TC14) */}
                    {currentStep === 'new_password' && (
                        <form onSubmit={submitPassword} className="space-y-4" noValidate>
                            <div>
                                <label htmlFor="kata_sandi_baru" className="form-label-base">Kata Sandi Baru</label>
                                <div className="mt-1">
                                    <input
                                        id="kata_sandi_baru"
                                        type="password"
                                        name="kata_sandi_baru"
                                        value={passwordForm.data.kata_sandi_baru}
                                        placeholder="••••••••"
                                        className="auth-standalone-input"
                                        onChange={(e) => passwordForm.setData('kata_sandi_baru', e.target.value)}
                                    />
                                </div>
                                {passwordForm.errors.kata_sandi_baru && (
                                    <p className="text-red-600 font-bold text-xs mt-1">
                                        {passwordForm.errors.kata_sandi_baru}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="konfirmasi_kata_sandi" className="form-label-base">Konfirmasi Kata Sandi</label>
                                <div className="mt-1">
                                    <input
                                        id="konfirmasi_kata_sandi"
                                        type="password"
                                        name="konfirmasi_kata_sandi"
                                        value={passwordForm.data.konfirmasi_kata_sandi}
                                        placeholder="••••••••"
                                        className="auth-standalone-input"
                                        onChange={(e) => passwordForm.setData('konfirmasi_kata_sandi', e.target.value)}
                                    />
                                </div>
                                {passwordForm.errors.kata_sandi_baru_confirmation && (
                                    <p className="text-red-600 font-bold text-xs mt-1">
                                        {passwordForm.errors.kata_sandi_baru_confirmation}
                                    </p>
                                )}
                                {passwordForm.errors.konfirmasi_kata_sandi && (
                                    <p className="text-red-600 font-bold text-xs mt-1">
                                        {passwordForm.errors.konfirmasi_kata_sandi}
                                    </p>
                                )}
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="auth-standalone-btn w-full"
                                >
                                    {passwordForm.processing ? 'Menyimpan...' : 'Ganti Kata Sandi'}
                                </button>
                            </div>

                            <div className="text-center mt-4">
                                <Link href={backLoginUrl} className="text-xs font-bold text-black hover:underline uppercase tracking-wider">
                                    Kembali ke Login
                                </Link>
                            </div>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
}
