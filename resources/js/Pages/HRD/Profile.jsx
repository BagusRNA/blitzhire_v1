import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import HRDLayout from '@/Layouts/HRDLayout';

export default function HRDProfile({ hrd }) {
    const { flash } = usePage().props;

    const { data, setData, patch, processing, errors, recentlySuccessful, reset } = useForm({
        nama_pengguna: hrd?.nama_pengguna || '',
        email: hrd?.email || '',
        kata_sandi: '',
        kata_sandi_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('hrd.profile.update'), {
            onSuccess: () => reset('kata_sandi', 'kata_sandi_confirmation'),
        });
    };

    return (
        <HRDLayout title="Profile Admin / HRD">
            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="border-b border-gray-200 pb-5">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Profile Admin / HRD</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Kelola data profil dan kredensial akun administrator HRD BlitzHire.
                    </p>
                </div>

                {/* Flash Success Message */}
                {(flash?.success || recentlySuccessful) && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-800 text-sm font-medium">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{flash?.success || 'Profil Admin/HRD berhasil diperbarui.'}</span>
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 bg-gray-50 border-b border-gray-200 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-black shadow-sm">
                            {(data.nama_pengguna || 'HRD').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{data.nama_pengguna || 'Admin / HRD'}</h2>
                            <p className="text-sm text-gray-500">{data.email}</p>
                            <span className="inline-block mt-1 px-2.5 py-0.5 bg-orange-100 text-orange-800 text-xs font-semibold rounded">
                                Role: Human Resource Department (HRD)
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                    Nama Pengguna / Username
                                </label>
                                <input
                                    type="text"
                                    value={data.nama_pengguna}
                                    onChange={(e) => setData('nama_pengguna', e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    required
                                />
                                {errors.nama_pengguna && (
                                    <p className="mt-1 text-xs text-red-600 font-semibold">{errors.nama_pengguna}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                    Email HRD
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
        </HRDLayout>
    );
}

