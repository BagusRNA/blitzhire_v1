import React from 'react';
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

    const handleAction = (action) => {
        if (confirm(`Yakin ingin ${action.toUpperCase()} kandidat ini?`)) {
            router.post(route(`hrd.kandidat.${action}`, lamaran.id_lamaran));
        }
    };

    return (
        <KandidatDetailLayout title="Detail Pelamar" lamaran={lamaran}>
            <div className="kandidat-flow">

                {/* Extra Info Fields */}
                <div className="kandidat-info-stack">
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

                    {/* CV / Resume */}
                    <div>
                        <span className="form-label-base block mb-2">CV / Resume</span>
                        {resume ? (
                            <div className="kandidat-doc-row">
                                <div className="kandidat-doc-meta">
                                    <span className="hrd-doc-icon">PDF</span>
                                    <span className="kandidat-doc-filename">
                                        {resume.file_dokumen}
                                    </span>
                                </div>
                                <div className="kandidat-doc-actions">
                                    <a
                                        href={`/storage/${resume.path_file}`}
                                        target="_blank"
                                        className="btn-secondary-sm"
                                    >
                                        LIHAT CV
                                    </a>
                                    <a
                                        href={`/storage/${resume.path_file}`}
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
            </div>
        </KandidatDetailLayout>
    );
}
