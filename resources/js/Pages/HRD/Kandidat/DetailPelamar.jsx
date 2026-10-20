import React from 'react';
import { router } from '@inertiajs/react';
import KandidatDetailLayout from '@/Components/HRD/KandidatDetailLayout';
import InfoCard from '@/Components/InfoCard';

export default function DetailPelamar({ lamaran }) {
    const pelamar = lamaran.pelamar;
    const sosmed = pelamar?.sosial_media || [];
    const resume = lamaran.dokumen?.find(d => d.jenis_dokumen === 'Resume/CV');

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
                    <InfoCard label="Alamat" value={pelamar?.alamat_saat_ini ?? '—'} />
                    <InfoCard label="Domisili" value={pelamar?.domisili ?? '—'} />
                </div>

                {/* Social Media & CV Box */}
                <div className="kandidat-box">
                    <div className="kandidat-box-label">Media Sosial &amp; CV</div>

                    {/* Social Media Links */}
                    {sosmed.length > 0 && (
                        <div className="kandidat-sosmed-list">
                            {sosmed.map((sm, idx) => (
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
                            ))}
                        </div>
                    )}

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
                <div className="kandidat-action-grid-2">
                    <button
                        onClick={() => handleAction('tolak')}
                        className="btn-secondary w-full"
                    >
                        TOLAK
                    </button>
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
