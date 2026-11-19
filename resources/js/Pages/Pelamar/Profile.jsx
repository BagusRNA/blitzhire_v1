import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import PelamarLayout from '@/Layouts/PelamarLayout';

export default function PelamarProfile({ pelamar }) {
    const { flash } = usePage().props;

    const { data, setData, patch, processing, errors, recentlySuccessful, reset } = useForm({
        nama_lengkap: pelamar?.nama_lengkap || '',
        email: pelamar?.email || '',
        nomor_hp: pelamar?.nomor_hp || '',
        pendidikan_terakhir: pelamar?.pendidikan_terakhir || 'S1',
        alamat: pelamar?.alamat || '',
        kata_sandi: '',
        kata_sandi_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('pelamar.profile.update'), {
            onSuccess: () => reset('kata_sandi', 'kata_sandi_confirmation'),
        });
    };

    return (
        <PelamarLayout title="Profile Pelamar">
            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="border-b border-gray-200 pb-5">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Profile Pelamar</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Kelola data pribadi dan informasi akun pelamar Anda untuk kemudahan melamar pekerjaan.
                    </p>
                </div>

                {/* Flash Success Message */}
                {(flash?.success || recentlySuccessful) && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-800 text-sm font-medium">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{flash?.success || 'Profil pelamar berhasil diperbarui.'}</span>
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 bg-gray-50 border-b border-gray-200 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-black shadow-sm">
                            {(data.nama_lengkap || 'P').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{data.nama_lengkap || 'Nama Pelamar'}</h2>
                            <p className="text-sm text-gray-500">{data.email}</p>
                            <span className="inline-block mt-1 px-2.5 py-0.5 bg-orange-100 text-orange-800 text-xs font-semibold rounded">
                                Role: Pelamar Pekerjaan
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    value={data.nama_lengkap}
                                    onChange={(e) => setData('nama_lengkap', e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    required
                                />
                                {errors.nama_lengkap && (
                                    <p className="mt-1 text-xs text-red-600 font-semibold">{errors.nama_lengkap}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    required
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-600 font-semibold">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                    Nomor WhatsApp / HP
                                </label>
                                <input
                                    type="text"
                                    value={data.nomor_hp}
                                    onChange={(e) => setData('nomor_hp', e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    required
                                />
                                {errors.nomor_hp && (
                                    <p className="mt-1 text-xs text-red-600 font-semibold">{errors.nomor_hp}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                    Pendidikan Terakhir
                                </label>
                                <select
                                    value={data.pendidikan_terakhir}
                                    onChange={(e) => setData('pendidikan_terakhir', e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                                    required
                                >
                                    <option value="SMA / SMK">SMA / SMK</option>
                                    <option value="D3">D3</option>
                                    <option value="D4">D4</option>
                                    <option value="S1">S1</option>
                                    <option value="S2">S2</option>
                                    <option value="S3">S3</option>
                                </select>
                                {errors.pendidikan_terakhir && (
                                    <p className="mt-1 text-xs text-red-600 font-semibold">{errors.pendidikan_terakhir}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                Alamat Domisili
                            </label>
                            <textarea
                                rows="3"
                                value={data.alamat}
                                onChange={(e) => setData('alamat', e.target.value)}
                                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                required
                            />
                            {errors.alamat && (
                                <p className="mt-1 text-xs text-red-600 font-semibold">{errors.alamat}</p>
                            )}
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-1">
                                Ubah Password (Opsional)
                            </h3>
                            <p className="text-xs text-gray-500 mb-4">
                                Kosongkan jika Anda tidak ingin mengganti password akun Anda.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                        Password Baru
                                    </label>
                                    <input
                                        type="password"
                                        value={data.kata_sandi}
                                        onChange={(e) => setData('kata_sandi', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                    {errors.kata_sandi && (
                                        <p className="mt-1 text-xs text-red-600 font-semibold">{errors.kata_sandi}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                        Konfirmasi Password Baru
                                    </label>
                                    <input
                                        type="password"
                                        value={data.kata_sandi_confirmation}
                                        onChange={(e) => setData('kata_sandi_confirmation', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition shadow disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </PelamarLayout>
    );
}

