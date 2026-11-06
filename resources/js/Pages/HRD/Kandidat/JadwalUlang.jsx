import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import KandidatDetailLayout from '@/Components/HRD/KandidatDetailLayout';

export default function JadwalUlang({ lamaran, jadwalTerakhir, pengajuanPelamar, usulanPelamar, rescheduleCount }) {
    const formatInitialDateTime = (dateStr) => {
        if (!dateStr) return '';
        try {
            return String(dateStr).replace(' ', 'T').slice(0, 16);
        } catch {
            return '';
        }
    };

    // Pre-fill with pelamar's requested date & time if available, otherwise fallback to existing schedule
    const getInitialDateTime = () => {
        if (usulanPelamar?.tanggal) {
            const timeRaw = usulanPelamar.waktu ? usulanPelamar.waktu.replace(' WIB', '').replace('.', ':').trim() : '09:00';
            const timePart = timeRaw.includes(':') ? timeRaw.slice(0, 5) : `${timeRaw}:00`;
            return `${usulanPelamar.tanggal}T${timePart}`;
        }
        return formatInitialDateTime(jadwalTerakhir?.tanggal_wawancara);
    };

    const { data, setData, post, processing, errors } = useForm({
        tanggal_wawancara: getInitialDateTime(),
        link_meeting: jadwalTerakhir?.link_meeting ?? '',
        format_wawancara: jadwalTerakhir?.format_wawancara ?? 'Online',
        alasan_hrd: '',
    });

    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [alasanPenolakan, setAlasanPenolakan] = useState('');
    const [isSubmittingReject, setIsSubmittingReject] = useState(false);

    const submitJadwalUlang = (e) => {
        e.preventDefault();
        post(route('hrd.kandidat.reschedule', lamaran.id_lamaran));
    };

    const handleConfirmReject = () => {
        if (!alasanPenolakan.trim()) {
            alert('Mohon cantumkan alasan penolakan jadwal ulang.');
            return;
        }
        setIsSubmittingReject(true);
        router.post(route('hrd.kandidat.reschedule_reject', lamaran.id_lamaran), {
            alasan_penolakan: alasanPenolakan.trim()
        }, {
            onFinish: () => {
                setIsSubmittingReject(false);
                setRejectModalOpen(false);
            }
        });
    };

    return (
        <KandidatDetailLayout title="Jadwal Ulang Wawancara" lamaran={lamaran}>
            <form onSubmit={submitJadwalUlang} className="kandidat-form-flow">

                {/* Candidate reschedule request preview if any */}
                {pengajuanPelamar && (
                    <div className="kandidat-alert-amber">
                        <div className="kandidat-alert-header flex items-center justify-between">
                            <span className="kandidat-alert-pill">
                                Permintaan Dari Pelamar
                            </span>
                            <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 uppercase tracking-wider">
                                Pengajuan ke-{rescheduleCount || 1} dari 3 kali
                            </span>
                        </div>
                        <div className="kandidat-alert-mono mt-2">
                            {pengajuanPelamar}
                        </div>
                    </div>
                )}
                
                {/* Form Fields */}
                <div className="kandidat-form-stack">
                    <div className="form-group">
                        <label className="form-label-base">Tanggal & Waktu Wawancara</label>
                        <input
                            type="datetime-local"
                            className="form-input-base"
                            value={data.tanggal_wawancara}
                            onChange={e => setData('tanggal_wawancara', e.target.value)}
                            required
                        />
                        {errors.tanggal_wawancara && <span className="form-error-base">{errors.tanggal_wawancara}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label-base">Link Wawancara</label>
                        <input
                            type="text"
                            placeholder="https://meet.google.com/..."
                            className="form-input-base"
                            value={data.link_meeting}
                            onChange={e => setData('link_meeting', e.target.value)}
                        />
                        {errors.link_meeting && <span className="form-error-base">{errors.link_meeting}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label-base">
                            Catatan / Alasan HRD <span className="text-gray-400 font-normal">(Opsional)</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Tambahkan catatan untuk pelamar (opsional)..."
                            className="form-input-base"
                            value={data.alasan_hrd}
                            onChange={e => setData('alasan_hrd', e.target.value)}
                        />
                        {errors.alasan_hrd && <span className="form-error-base">{errors.alasan_hrd}</span>}
                    </div>
                </div>

                {/* Actions: Accept or Reject when candidate requested reschedule */}
                <div className="kandidat-action-mt">
                    {pengajuanPelamar ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRejectModalOpen(true)}
                                disabled={processing || isSubmittingReject}
                                className="w-full py-3 px-4 rounded font-bold text-xs uppercase tracking-wider border-2 border-red-600 text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-center"
                            >
                                ✕ Tolak Pengajuan
                            </button>
                            <button
                                type="submit"
                                disabled={processing || isSubmittingReject}
                                className="btn-primary w-full text-xs !py-3 tracking-widest font-bold"
                            >
                                {processing ? 'Menyimpan...' : '✓ Terima & Jadwalkan'}
                            </button>
                        </div>
                    ) : (
                        <button type="submit" disabled={processing} className="btn-primary w-full text-base">
                            {processing ? 'Menyimpan...' : 'JADWAL ULANG'}
                        </button>
                    )}
                </div>
            </form>

            {/* Modal Tolak Pengajuan Jadwal Ulang */}
            {rejectModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white border-2 border-black rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                            <h3 className="text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2">
                                <span className="text-red-600 font-black text-base">✕</span>
                                Tolak Pengajuan Jadwal Ulang
                            </h3>
                            <button
                                type="button"
                                onClick={() => setRejectModalOpen(false)}
                                className="text-gray-400 hover:text-black font-bold text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed">
                            Kandidat akan tetap mengikuti sesi wawancara sesuai jadwal semula. Silakan berikan alasan penolakan yang jelas untuk disampaikan kepada pelamar.
                        </p>

                        <div>
                            <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                                Alasan Penolakan <span className="text-red-600">*</span>
                            </label>
                            <textarea
                                rows="3"
                                placeholder="Contoh: Maaf, pada jam tersebut pewawancara memiliki agenda lain yang tidak dapat digeser..."
                                value={alasanPenolakan}
                                onChange={(e) => setAlasanPenolakan(e.target.value)}
                                className="form-input-base w-full resize-none text-xs"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setRejectModalOpen(false)}
                                className="btn-secondary w-full text-xs font-bold py-2.5"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isSubmittingReject}
                                onClick={handleConfirmReject}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded transition-colors w-full cursor-pointer disabled:opacity-50"
                            >
                                {isSubmittingReject ? 'Memproses...' : 'Kirim Penolakan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </KandidatDetailLayout>
    );
}
