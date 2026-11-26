import React from 'react';
import { useForm, router } from '@inertiajs/react';
import KandidatDetailLayout from '@/Components/HRD/KandidatDetailLayout';

export default function Penawaran({ lamaran }) {
    const existingOffer = lamaran.penawaran && lamaran.penawaran.length > 0
        ? lamaran.penawaran[lamaran.penawaran.length - 1]
        : null;

    const { data, setData, post, processing, errors } = useForm({
        nominal_gaji: existingOffer?.nominal_gaji ? String(Math.round(existingOffer.nominal_gaji)) : '',
        tipe_penawaran: existingOffer?.tipe_penawaran || lamaran.lowongan?.tipe_pekerjaan || 'Full-Time',
        posisi_kerja: existingOffer?.posisi_kerja || lamaran.lowongan?.judul_lowongan || lamaran.lowongan?.posisi || 'Posisi',
        lokasi_kerja: existingOffer?.lokasi_kerja || lamaran.lowongan?.lokasi || 'Lokasi',
    });

    const submitPenawaran = (e) => {
        e.preventDefault();
        post(route('hrd.kandidat.offer', lamaran.id_lamaran));
    };

    const formatCurrency = (val) => {
        if (!val) return '0';
        const num = Number(val);
        return isNaN(num) ? val : num.toLocaleString('id-ID');
    };

    return (
        <KandidatDetailLayout title="Penawaran" lamaran={lamaran}>
            <div className="space-y-4">
                {/* ── Riwayat Penawaran Sebelumnya (HRD 19) ── */}
                {existingOffer && (
                    <div className="p-4 bg-orange-50 border border-orange-300 rounded-lg shadow-xs">
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-orange-200">
                            <span className="text-xs font-bold uppercase tracking-wider text-orange-950 flex items-center gap-1.5">
                                📋 Data Penawaran Sebelumnya Tersimpan
                            </span>
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                existingOffer.status_penawaran === 'Diterima'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : existingOffer.status_penawaran === 'Ditolak'
                                    ? 'bg-red-100 text-red-800 border border-red-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                                Status: {existingOffer.status_penawaran || 'Menunggu'}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-orange-900">
                            <div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase block">Gaji Ditawarkan</span>
                                <strong className="text-gray-900">Rp {formatCurrency(existingOffer.nominal_gaji)}</strong>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase block">Posisi</span>
                                <strong className="text-gray-900">{existingOffer.posisi_kerja || '—'}</strong>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase block">Lokasi</span>
                                <strong className="text-gray-900">{existingOffer.lokasi_kerja || '—'}</strong>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase block">Tanggal Penawaran</span>
                                <strong className="text-gray-900">
                                    {existingOffer.tanggal_penawaran ? new Date(existingOffer.tanggal_penawaran).toLocaleDateString('id-ID') : '—'}
                                </strong>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={submitPenawaran} className="kandidat-form-flow">
                    {/* Form Fields */}
                    <div className="kandidat-form-grid-2">
                        <div className="form-group">
                            <label className="form-label-base">Posisi Kerja</label>
                            <input
                                type="text"
                                placeholder="Frontend Engineer"
                                className="form-input-base"
                                value={data.posisi_kerja}
                                onChange={e => setData('posisi_kerja', e.target.value)}
                                required
                            />
                            {errors.posisi_kerja && <span className="form-error-base">{errors.posisi_kerja}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label-base">Lokasi Kerja</label>
                            <input
                                type="text"
                                placeholder="Bandung"
                                className="form-input-base"
                                value={data.lokasi_kerja}
                                onChange={e => setData('lokasi_kerja', e.target.value)}
                                required
                            />
                            {errors.lokasi_kerja && <span className="form-error-base">{errors.lokasi_kerja}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label-base">Tipe Penawaran</label>
                            <select
                                className="form-select-base cursor-pointer"
                                value={data.tipe_penawaran}
                                onChange={e => setData('tipe_penawaran', e.target.value)}
                            >
                                <option value="Full-Time">Full-Time</option>
                                <option value="Part-Time">Part-Time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label-base">Nominal Gaji (IDR / Bulan)</label>
                            <input
                                type="number"
                                placeholder="7000000"
                                className="form-input-base"
                                value={data.nominal_gaji}
                                onChange={e => setData('nominal_gaji', e.target.value)}
                                required
                            />
                            {errors.nominal_gaji && <span className="form-error-base">{errors.nominal_gaji}</span>}
                        </div>
                    </div>

                    <div className="card-base-sm my-2">
                        <div className="text-xs text-gray-600 flex justify-between items-center">
                            <span>Status Pengajuan: <strong className="text-black">{existingOffer ? `Terakhir: ${existingOffer.status_penawaran || 'Menunggu'}` : 'Menunggu Respon Kandidat'}</strong></span>
                            <span>Tanggal: <strong className="text-black">{new Date().toLocaleDateString('id-ID')}</strong></span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="kandidat-action-mt">
                        <button type="submit" disabled={processing} className="btn-primary w-full text-base cursor-pointer font-bold tracking-wider">
                            {processing ? 'Menyimpan...' : (existingOffer ? 'PERBARUI & AJUKAN PENAWARAN' : 'AJUKAN PENAWARAN')}
                        </button>
                    </div>
                </form>
            </div>
        </KandidatDetailLayout>
    );
}
