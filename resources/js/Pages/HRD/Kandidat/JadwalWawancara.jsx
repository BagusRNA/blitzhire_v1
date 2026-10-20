import React from 'react';
import { useForm, router } from '@inertiajs/react';
import KandidatDetailLayout from '@/Components/HRD/KandidatDetailLayout';

export default function JadwalWawancara({ lamaran }) {
    const { data, setData, post, processing, errors } = useForm({
        tanggal_wawancara: '',
        link_meeting: '',
        format_wawancara: 'Online', // default untuk simplifikasi form, karena UI wireframe hanya minta 2 field
    });

    const submitJadwal = (e) => {
        e.preventDefault();
        post(route('hrd.kandidat.jadwalkan', lamaran.id_lamaran));
    };

    const lanjutTanpaWawancara = () => {
        if (confirm('Yakin ingin melanjutkan tanpa wawancara? (Kandidat akan pindah ke Penawaran)')) {
            router.post(route('hrd.kandidat.lanjut_tanpa_wawancara', lamaran.id_lamaran));
        }
    };

    return (
        <KandidatDetailLayout title="Jadwal Wawancara" lamaran={lamaran}>
            <form onSubmit={submitJadwal} className="kandidat-form-flow">
                
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
                <div className="kandidat-action-grid-responsive">
                    <button type="button" onClick={lanjutTanpaWawancara} className="btn-secondary w-full text-base">
                        LANJUT TANPA WAWANCARA
                    </button>
                    <button type="submit" disabled={processing} className="btn-primary w-full text-base">
                        {processing ? 'Menyimpan...' : 'JADWALKAN WAWANCARA'}
                    </button>
                </div>
            </form>
        </KandidatDetailLayout>
    );
}
