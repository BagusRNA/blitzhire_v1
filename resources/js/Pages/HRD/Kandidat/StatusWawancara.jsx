import React from 'react';
import { router } from '@inertiajs/react';
import KandidatDetailLayout from '@/Components/HRD/KandidatDetailLayout';
import InfoCard from '@/Components/InfoCard';

export default function StatusWawancara({ lamaran, jadwalTerakhir, pengajuanPelamar }) {
    
    const sudahWawancara = () => {
        // Lanjut ke halaman pengisian hasil (Note)
        router.get(route('hrd.kandidat.hasil_wawancara', lamaran.id_lamaran));
    };

    const belumWawancara = () => {
        // Kembali ke dashboard/kanban karena wawancara belum terjadi
        router.get(route('hrd.manajemen-kandidat'));
    };

    // Format tampilan tanggal
    const tanggalWawancara = jadwalTerakhir?.tanggal_wawancara 
        ? new Date(jadwalTerakhir.tanggal_wawancara).toLocaleString('id-ID', {
            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
          }) 
        : 'Belum ada jadwal';

    const isDitunda = jadwalTerakhir?.status_wawancara === 'Ditunda' || Boolean(pengajuanPelamar);

    return (
        <KandidatDetailLayout title="Jadwal Wawancara" lamaran={lamaran}>
            <div className="kandidat-form-flow">

                {/* Reschedule Alert from Pelamar */}
                {isDitunda && (
                    <div className="kandidat-alert-warning">
                        <div className="kandidat-alert-row">
                            <span className="kandidat-alert-badge">
                                ⚠️ Pelamar Mengajukan Jadwal Ulang
                            </span>
                            <span className="kandidat-alert-label">Status: PENDING</span>
                        </div>
                        <p className="kandidat-alert-desc">
                            Kandidat ini mengajukan perubahan waktu wawancara:
                        </p>
                        <div className="kandidat-alert-body">
                            {pengajuanPelamar || jadwalTerakhir?.catatan || 'Kandidat meminta jadwal ulang wawancara.'}
                        </div>
                        <button
                            type="button"
                            onClick={() => router.get(route('hrd.kandidat.jadwal_ulang', lamaran.id_lamaran))}
                            className="btn-kandidat-reschedule"
                        >
                            SETUJUI & ATUR JADWAL ULANG WAWANCARA
                        </button>
                    </div>
                )}
                
                {/* Info Fields */}
                <div className="kandidat-form-stack">
                    <InfoCard
                        label="Tanggal & Waktu Wawancara Terjadwal"
                        value={tanggalWawancara}
                    />

                    <InfoCard
                        label="Link Wawancara / Lokasi"
                        value={jadwalTerakhir?.format_wawancara === 'Online' 
                            ? (jadwalTerakhir?.link_meeting || '—') 
                            : (jadwalTerakhir?.lokasi || '—')}
                    />
                </div>

                {/* Actions */}
                <div className="kandidat-form-stack mt-4">
                    <div className="kandidat-action-grid-2">
                        <button onClick={belumWawancara} className="btn-secondary w-full text-base">
                            BELUM WAWANCARA
                        </button>
                        <button onClick={sudahWawancara} className="btn-primary w-full text-base">
                            SUDAH WAWANCARA
                        </button>
                    </div>
                    
                    {/* Reschedule option */}
                    <div className="kandidat-action-center">
                        <button 
                            type="button" 
                            onClick={() => router.get(route('hrd.kandidat.jadwal_ulang', lamaran.id_lamaran))} 
                            className="kandidat-reschedule-link"
                        >
                            Klik di sini untuk Menjadwalkan Ulang Wawancara
                        </button>
                    </div>
                </div>
            </div>
        </KandidatDetailLayout>
    );
}
