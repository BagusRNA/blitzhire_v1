import React from 'react';
import { router, Link } from '@inertiajs/react';
import KandidatDetailLayout from '@/Components/HRD/KandidatDetailLayout';

export default function PengajuanPelamar({ lamaran, jadwalTerakhir }) {
    
    const handleAction = (action) => {
        if (confirm(`Yakin ingin ${action.toUpperCase()} pengajuan ini?`)) {
            router.post(route(`hrd.kandidat.${action}`, lamaran.id_lamaran));
        }
    };

    // Format tanggal untuk ditampilkan
    const tanggalDiajukan = jadwalTerakhir?.tanggal_wawancara 
        ? new Date(jadwalTerakhir.tanggal_wawancara).toLocaleString('id-ID', {
            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
          }) 
        : 'Belum ada jadwal yang diajukan';

    return (
        <KandidatDetailLayout title="Pengajuan Pelamar" lamaran={lamaran}>
            
            <div className="kandidat-form-flow">
                {/* Proposed Schedule */}
                <div className="form-group">
                    <label className="form-label-base">Tanggal & Waktu Wawancara yang Diajukan</label>
                    <input
                        type="text"
                        className="form-input-readonly"
                        value={tanggalDiajukan}
                        readOnly
                    />
                </div>

                {/* Actions */}
                <div className="kandidat-action-grid-3">
                    <button onClick={() => handleAction('tolak')} className="btn-secondary w-full text-base">
                        TOLAK
                    </button>
                    <Link href={route('hrd.kandidat.jadwal_ulang', lamaran.id_lamaran)} className="btn-secondary w-full text-base">
                        JADWAL ULANG
                    </Link>
                    <button onClick={() => handleAction('terima')} className="btn-primary w-full text-base">
                        TERIMA
                    </button>
                </div>
            </div>
            
        </KandidatDetailLayout>
    );
}
