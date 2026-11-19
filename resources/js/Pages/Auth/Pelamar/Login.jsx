import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function PelamarLogin({ status }) {
    const [showSuccessModal, setShowSuccessModal] = useState(Boolean(status));
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        kata_sandi: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('pelamar.auth.login'));
    };

    return (
        <div className="auth-page-light">
            <Head title="Candidate Login - BlitzHire" />
            
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="text-3xl font-black text-black tracking-tight uppercase">
                        BlitzHire
                    </Link>
                    <p className="mt-2 text-gray-500 font-bold text-xs uppercase tracking-wider">Candidate Portal</p>
                </div>

                <div className="auth-card-light">
                    <h2 className="text-xl font-bold text-black mb-1 uppercase tracking-tight">Welcome back</h2>
                    <p className="text-gray-500 text-xs mb-6">Track your applications and manage your career journey.</p>

                    {status && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-600 text-green-900 rounded text-xs font-bold flex items-center justify-between">
                            <span>{status}</span>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4" noValidate>
                        <div>
                            <label className="auth-label-light">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                placeholder="budi@gmail.com"
                                className="auth-input-light"
                            />
                            {errors.email && <p className="form-error-base text-red-600 font-bold text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="auth-label-light mb-0">Password</label>
                                <Link href={route('password.request', { role: 'pelamar' })} className="text-xs text-black font-bold hover:underline">Lupa Sandi?</Link>
                            </div>
                            <input
                                id="kata_sandi"
                                type="password"
                                value={data.kata_sandi}
                                onChange={e => setData('kata_sandi', e.target.value)}
                                placeholder="••••••••"
                                className="auth-input-light"
                            />
                            {errors.kata_sandi && <p className="form-error-base text-red-600 font-bold text-xs mt-1">{errors.kata_sandi}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="auth-btn-light"
                        >
                            {processing ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                        <p className="text-gray-600 text-xs font-medium">
                            Don't have an account?{' '}
                            <Link href={route('pelamar.auth.showRegister')} className="text-black font-bold hover:underline transition">
                                Register here
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-gray-500 text-xs mt-6">
                    Are you an HR admin?{' '}
                    <Link href={route('hrd.auth.showLogin')} className="text-black font-bold hover:underline transition">
                        HRD Login
                    </Link>
                </p>
            </div>

            {/* Modal Pop-up Registrasi Berhasil (Pelamar 1) */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all border border-gray-100">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Akun anda berhasil dibuat!</h3>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            {status || 'Akun Anda telah terdaftar. Silakan masuk menggunakan email dan kata sandi Anda.'}
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition shadow-md hover:shadow-lg focus:outline-none"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
