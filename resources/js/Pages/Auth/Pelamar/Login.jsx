import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function PelamarLogin({ status }) {
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

                    {status && <div className="mb-4 p-3 bg-gray-100 border border-gray-800 text-black rounded text-xs font-bold">{status}</div>}

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="auth-label-light">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                required
                                placeholder="budi@gmail.com"
                                className="auth-input-light"
                            />
                            {errors.email && <p className="form-error-base">{errors.email}</p>}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="auth-label-light mb-0">Password</label>
                                <Link href={route('password.request')} className="text-xs text-black font-bold hover:underline">Forgot password?</Link>
                            </div>
                            <input
                                id="kata_sandi"
                                type="password"
                                value={data.kata_sandi}
                                onChange={e => setData('kata_sandi', e.target.value)}
                                required
                                placeholder="••••••••"
                                className="auth-input-light"
                            />
                            {errors.kata_sandi && <p className="form-error-base">{errors.kata_sandi}</p>}
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
        </div>
    );
}
