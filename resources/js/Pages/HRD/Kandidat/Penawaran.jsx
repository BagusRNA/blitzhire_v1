import React from 'react';
import { useForm, router } from '@inertiajs/react';
import KandidatDetailLayout from '@/Components/HRD/KandidatDetailLayout';

export default function Penawaran({ lamaran }) {
    const { data, setData, post, processing, errors } = useForm({
        nominal_gaji: '',
        tipe_penawaran: lamaran.lowongan?.tipe_pekerjaan ?? 'Full-Time',
        posisi_kerja: lamaran.lowongan?.judul_lowongan ?? lamaran.lowongan?.posisi ?? 'Posisi',
        lokasi_kerja: lamaran.lowongan?.lokasi ?? 'Lokasi',
    });

    const submitPenawaran = (e) => {
        e.preventDefault();
        post(route('hrd.kandidat.offer', lamaran.id_lamaran));
    };

    return (
        <KandidatDetailLayout title="Penawaran" lamaran={lamaran}>
            <form onSubmit={submitPenawaran} className="kandidat-form-flow">
                
                {/* Form Fields */}
                <div className="kandidat-form-grid-2">
                    <div className="form-group">
                        <label className="form-label-base">Tipe Penawaran</label>
                        <select
                            className="form-select-base"
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
                        <label className="form-label-base">Gaji</label>
                        <input
                            type="number"
                            placeholder="IDR 5x.xxx.xxx"
                            className="form-input-base"
                            value={data.nominal_gaji}
                            onChange={e => setData('nominal_gaji', e.target.value)}
                            required
                        />
                        {errors.nominal_gaji && <span className="form-error-base">{errors.nominal_gaji}</span>}
                    </div>
                </div>

                {/* Actions */}
                <div className="kandidat-action-mt">
                    <button type="submit" disabled={processing} className="btn-primary w-full text-base">
                        {processing ? 'Menyimpan...' : 'AJUKAN PENAWARAN'}
                    </button>
                </div>
            </form>
        </KandidatDetailLayout>
    );
}
