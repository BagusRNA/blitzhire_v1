import React from 'react';
import { useForm } from '@inertiajs/react';
import KandidatDetailLayout from '@/Components/HRD/KandidatDetailLayout';

export default function JadwalUlang({ lamaran, jadwalTerakhir, pengajuanPelamar }) {
    const { data, setData, post, processing, errors } = useForm({
        tanggal_wawancara: jadwalTerakhir?.tanggal_wawancara ? new Date(jadwalTerakhir.tanggal_wawancara).toISOString().slice(0, 16) : '',
        link_meeting: jadwalTerakhir?.link_meeting ?? '',
        format_wawancara: jadwalTerakhir?.format_wawancara ?? 'Online',
    });

    const submitJadwalUlang = (e) => {
        e.preventDefault();
        post(route('hrd.kandidat.reschedule', lamaran.id_lamaran));
    };

    return (
        <KandidatDetailLayout title="Jadwal Ulang Wawancara" lamaran={lamaran}>
            <form onSubmit={submitJadwalUlang} className="kandidat-form-flow">

                {/* Candidate reschedule request preview if any */}
                {pengajuanPelamar && (
                    <div className="kandidat-alert-amber">
                        <div className="kandidat-alert-header">
                            <span className="kandidat-alert-pill">
                                Permintaan Dari Pelamar
                            </span>
                        </div>
                        <div className="kandidat-alert-mono">
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
                </div>

                {/* Actions */}
                <div className="kandidat-action-mt">
                    <button type="submit" disabled={processing} className="btn-primary w-full text-base">
                        {processing ? 'Menyimpan...' : 'JADWAL ULANG'}
                    </button>
                </div>
            </form>
        </KandidatDetailLayout>
    );
}
