import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function PelamarRegister() {
    const { data, setData, post, processing, errors } = useForm({
        nama_lengkap: '',
        email: '',
        kata_sandi: '',
        kata_sandi_confirmation: '',
        nomor_hp: '',
        alamat: '',
        pendidikan_terakhir: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('pelamar.auth.register'));
    };

    return (
        <div className="auth-page-light-tall">
            <Head title="Register - BlitzHire" />
            
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <Link href="/" className="text-3xl font-black text-black tracking-tight uppercase">
                        BlitzHire
                    </Link>
                    <p className="mt-2 text-gray-500 font-bold text-xs uppercase tracking-wider">Create candidate account</p>
                </div>

                <div className="auth-card-light">
                    <h2 className="text-xl font-bold text-black mb-1 uppercase tracking-tight">Join BlitzHire</h2>
                    <p className="text-gray-500 text-xs mb-6">Fill in your details to start your application journey.</p>

                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="form-label-base">Full Name</label>
                                <input
                                    type="text"
                                    value={data.nama_lengkap}
                                    onChange={e => setData('nama_lengkap', e.target.value)}
                                    placeholder="Budi Santoso"
                                    className="form-input-base"
                                    required
                                />
                                {errors.nama_lengkap && <p className="form-error-base">{errors.nama_lengkap}</p>}
                            </div>

                            <div>
                                <label className="form-label-base">Email Address</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder="budi@gmail.com"
                                    className="form-input-base"
                                    required
                                />
                                {errors.email && <p className="form-error-base">{errors.email}</p>}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="form-label-base">Password</label>
                                <input
                                    type="password"
                                    value={data.kata_sandi}
                                    onChange={e => setData('kata_sandi', e.target.value)}
                                    placeholder="Minimum 8 characters"
                                    className="form-input-base"
                                    required
                                />
                                {errors.kata_sandi && <p className="form-error-base">{errors.kata_sandi}</p>}
                            </div>

                            <div>
                                <label className="form-label-base">Confirm Password</label>
                                <input
                                    type="password"
                                    value={data.kata_sandi_confirmation}
                                    onChange={e => setData('kata_sandi_confirmation', e.target.value)}
                                    placeholder="Repeat password"
                                    className="form-input-base"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="form-label-base">Phone Number</label>
                                <input
                                    type="text"
                                    value={data.nomor_hp}
                                    onChange={e => setData('nomor_hp', e.target.value)}
                                    placeholder="08123456789"
                                    className="form-input-base"
                                    required
                                />
                                {errors.nomor_hp && <p className="form-error-base">{errors.nomor_hp}</p>}
                            </div>

                            <div>
                                <label className="form-label-base">Last Education</label>
                                <select
                                    value={data.pendidikan_terakhir}
                                    onChange={e => setData('pendidikan_terakhir', e.target.value)}
                                    className="form-select-base"
                                    required
                                >
                                    <option value="">Select education</option>
                                    <option>S3 / Doktor</option>
                                    <option>S2 / Magister</option>
                                    <option>S1 Teknik Informatika</option>
                                    <option>S1 Sistem Informasi</option>
                                    <option>S1 Manajemen</option>
                                    <option>D3</option>
                                    <option>SMA/SMK</option>
                                </select>
                                {errors.pendidikan_terakhir && <p className="form-error-base">{errors.pendidikan_terakhir}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="form-label-base">Address</label>
                            <textarea
                                value={data.alamat}
                                onChange={e => setData('alamat', e.target.value)}
                                rows={2}
                                placeholder="Jl. Sudirman No. 1, Jakarta"
                                className="form-textarea-base"
                                required
                            />
                            {errors.alamat && <p className="form-error-base">{errors.alamat}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="auth-btn-light"
                        >
                            {processing ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                        <p className="text-gray-600 text-xs font-medium">
                            Already have an account?{' '}
                            <Link href={route('pelamar.auth.showLogin')} className="text-black font-bold hover:underline transition">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
