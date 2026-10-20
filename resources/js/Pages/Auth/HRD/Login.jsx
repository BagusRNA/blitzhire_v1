import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function HRDLogin({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        kata_sandi: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('hrd.auth.login'));
    };

    return (
        <div className="auth-page-dark">
            <Head title="HRD Login - BlitzHire" />
            
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="text-3xl font-black text-black tracking-tight uppercase">
                        BlitzHire
                    </Link>
                    <p className="mt-2 text-gray-500 font-bold text-xs uppercase tracking-wider">HR Portal — Admin Access</p>
                </div>

                {/* Card */}
                <div className="auth-card-dark">
                    <h2 className="text-xl font-bold text-black mb-1 uppercase tracking-tight">Welcome back</h2>
                    <p className="text-gray-500 text-xs mb-6">Sign in to manage your recruitment pipeline.</p>

                    {status && <div className="mb-4 p-3 bg-gray-100 border border-gray-800 text-black rounded text-xs font-bold">{status}</div>}

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="auth-label-dark">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                required
                                placeholder="hrd@blitzhire.com"
                                className="auth-input-dark"
                            />
                            {errors.email && <p className="form-error-base">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="auth-label-dark">Password</label>
                            <input
                                id="kata_sandi"
                                type="password"
                                value={data.kata_sandi}
                                onChange={e => setData('kata_sandi', e.target.value)}
                                required
                                placeholder="••••••••"
                                className="auth-input-dark"
                            />
                            {errors.kata_sandi && <p className="form-error-base">{errors.kata_sandi}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="auth-btn-dark"
                        >
                            {processing ? 'Signing in...' : 'Sign In as HRD'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-500 text-xs mt-6">
                    Are you a candidate?{' '}
                    <Link href={route('pelamar.auth.showLogin')} className="text-black font-bold hover:underline transition">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}
