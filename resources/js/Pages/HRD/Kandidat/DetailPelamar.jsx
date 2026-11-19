import React, { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import KandidatDetailLayout from '@/Components/HRD/KandidatDetailLayout';
import InfoCard from '@/Components/InfoCard';

export default function DetailPelamar({ lamaran }) {
    const pelamar = lamaran.pelamar;
    const sosmed = pelamar?.sosial_media || pelamar?.sosialMedia || [];
    const resume = lamaran.dokumen?.find(d => {
        const j = (d.jenis_dokumen || '').toLowerCase();
        return j.includes('cv') || j.includes('resume');
    }) || lamaran.dokumen?.[0];

    const [isReverting, setIsReverting] = useState(false);
    const [targetRevertStatus, setTargetRevertStatus] = useState('Screening');

    const handleAction = (action) => {
        if (confirm(`Yakin ingin ${action.toUpperCase()} kandidat ini?`)) {
            router.post(route(`hrd.kandidat.${action}`, lamaran.id_lamaran));
        }
    };

    const handleRevertStatus = (e) => {
        e.preventDefault();
        router.post(route('hrd.kandidat.revert_status', lamaran.id_lamaran), {
            target_status: targetRevertStatus
        }, {
            onSuccess: () => setIsReverting(false)
        });
    };

    const isFinalStatus = ['Diterima', 'Ditolak'].includes(lamaran.status_lamaran);

    return (
        <KandidatDetailLayout title="Detail Pelamar" lamaran={lamaran}>
            <div className="kandidat-flow">

                {/* Status Banner */}
                {isFinalStatus && (
                    <div className={`p-4 rounded border flex items-center justify-between mb-2 ${lamaran.status_lamaran === 'Diterima' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
                        <div>
                            <span className="font-bold text-xs uppercase tracking-wider block">
                                Status Kandidat Saat Ini: {lamaran.status_lamaran.toUpperCase()}
                            </span>
                            <span className="text-xs">
                                Anda dapat mengembalikan status kandidat ini jika ada perubahan keputusan.
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsReverting(true)}
                            className="px-3 py-1.5 bg-white border border-gray-400 text-gray-800 hover:bg-gray-100 rounded text-xs font-bold uppercase transition"
                        >
                            ↩ Ubah / Kembalikan Status
                        </button>
                    </div>
                )}

                {/* Modal Revert Status */}
                {isReverting && (
                    <div className="p-4 bg-amber-50 border border-amber-300 rounded mb-4 shadow-sm">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900 mb-2">
                            Kembalikan Status Pelamar
                        </h4>
                        <p className="text-xs text-amber-800 mb-3">
                            Pilih tahap proses rekrutmen untuk mengembalikan kandidat ini:
                        </p>
                        <form onSubmit={handleRevertStatus} className="flex items-center gap-3">
                            <select
                                value={targetRevertStatus}
                                onChange={(e) => setTargetRevertStatus(e.target.value)}
                                className="text-xs font-bold border border-gray-300 rounded px-3 py-1.5 bg-white"
                            >
                                <option value="Screening">Tahap Screening</option>
                                <option value="Wawancara">Tahap Wawancara</option>
                                <option value="Penawaran">Tahap Penawaran</option>
                            </select>
                            <button
                                type="submit"
                                className="px-4 py-1.5 bg-black text-white rounded text-xs font-bold uppercase hover:bg-gray-800 transition"
                            >
                                Konfirmasi Kembalikan
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsReverting(false)}
                                className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-100 transition"
                            >
                                Batal
                            </button>
                        </form>
                    </div>
                )}

                {/* Informasi Lowongan & Skor ATS (HRD 6) */}
                <div className="kandidat-info-stack">
                    <InfoCard label="Posisi yang Dilamar" value={lamaran.lowongan?.judul_lowongan || lamaran.lowongan?.posisi || '—'} />
                    <InfoCard label="Departemen" value={lamaran.lowongan?.departemen || '—'} />
                    <InfoCard label="Pendidikan Terakhir" value={pelamar?.pendidikan_terakhir || '—'} />
                    <InfoCard label="Skor Kecocokan ATS" value={lamaran.skor_kecocokan ? `${lamaran.skor_kecocokan}%` : '—'} />
                    <InfoCard label="Alamat" value={pelamar?.alamat ?? pelamar?.alamat_saat_ini ?? '—'} />
                    <InfoCard label="Domisili" value={pelamar?.domisili ?? pelamar?.alamat ?? '—'} />
                </div>

                {/* Social Media & CV Box */}
                <div className="kandidat-box">
                    <div className="kandidat-box-label">Media Sosial &amp; CV</div>

                    {/* Social Media Links */}
                    <div className="kandidat-sosmed-list">
                        {sosmed.length > 0 ? (
                            sosmed.map((sm, idx) => (
                                <div key={idx} className="kandidat-sosmed-item">
                                    <span className="form-label-base mb-0 capitalize">{sm.platform}</span>
                                    <a
                                        href={sm.link_sosmed}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="kandidat-sosmed-link"
                                    >
                                        {sm.link_sosmed}
                                    </a>
                                </div>
                            ))
                        ) : (
                            <div className="kandidat-sosmed-item">
                                <span className="form-label-base mb-0">LinkedIn</span>
                                <span className="text-xs text-gray-500 font-mono">
                                    https://linkedin.com/in/{pelamar?.nama_lengkap ? pelamar.nama_lengkap.toLowerCase().replace(/\s+/g, '-') : 'kandidat'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* CV / Resume (HRD 6) */}
                    <div>
                        <span className="form-label-base block mb-2">CV / Resume</span>
                        {resume ? (
                            <div className="kandidat-doc-row">
                                <div className="kandidat-doc-meta">
                                    <span className="hrd-doc-icon">PDF</span>
                                    <span className="kandidat-doc-filename">
                                        {resume.file_dokumen || 'Curriculum_Vitae.pdf'}
                                    </span>
                                </div>
                                <div className="kandidat-doc-actions">
                                    <a
                                        href={resume.id_dokumen ? route('hrd.kandidat.dokumen.view', resume.id_dokumen) : `/storage/${resume.path_file}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn-secondary-sm"
                                    >
                                        LIHAT CV
                                    </a>
                                    <a
                                        href={resume.id_dokumen ? route('hrd.kandidat.dokumen.download', resume.id_dokumen) : `/storage/${resume.path_file}`}
                                        download
                                        className="btn-primary-sm flex items-center gap-1"
                                    >
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                                        </svg>
                                        UNDUH CV
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="kandidat-doc-empty">
                                CV belum diunggah.
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                {!isFinalStatus ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                            onClick={() => handleAction('tolak')}
                            className="btn-secondary w-full"
                        >
                            TOLAK
                        </button>
                        <Link
                            href={route('hrd.kandidat.jadwal_wawancara', lamaran.id_lamaran)}
                            className="btn-primary w-full text-center flex items-center justify-center font-bold tracking-wider"
                        >
                            ATUR JADWAL WAWANCARA
                        </Link>
                        <button
                            onClick={() => handleAction('terima')}
                            className="btn-primary w-full"
                        >
                            TERIMA
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => setIsReverting(true)}
                            className="btn-secondary text-xs uppercase tracking-wider font-bold"
                        >
                            ↩ Kembalikan Status Kandidat
                        </button>
                    </div>
                )}
            </div>
        </KandidatDetailLayout>
    );
}
