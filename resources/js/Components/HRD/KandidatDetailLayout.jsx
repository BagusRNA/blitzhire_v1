import React from 'react';
import { Head, Link } from '@inertiajs/react';
import HRDLayout from '@/Layouts/HRDLayout';
import InfoCard from '@/Components/InfoCard';

export default function KandidatDetailLayout({ title, lamaran, children, backUrl = '/hrd/manajemen-kandidat' }) {
    const pelamar = lamaran?.pelamar;
    const photoUrl = pelamar?.foto_profil ? `/storage/${pelamar.foto_profil}` : null;

    return (
        <HRDLayout title={title}>
            <div className="kandidat-detail-container">

                {/* ── Header ── */}
                <div className="kandidat-detail-header">
                    <h1 className="kandidat-detail-title">{title}</h1>
                    <Link href={backUrl} className="btn-secondary">
                        ← KEMBALI
                    </Link>
                </div>

                {/* ── Main Content Grid ── */}
                <div className="kandidat-detail-grid">

                    {/* Left: Photo */}
                    <div className="kandidat-photo-col">
                        <div className="kandidat-photo-box">
                            {photoUrl ? (
                                <img src={photoUrl} alt="Foto Pelamar" className="kandidat-photo-img" />
                            ) : (
                                <span className="kandidat-photo-placeholder">[ Foto ]</span>
                            )}
                        </div>
                    </div>

                    {/* Right: Info & Content */}
                    <div className="kandidat-info-col">

                        {/* Basic Info as InfoCards */}
                        <div className="kandidat-info-stack">
                            <InfoCard label="Nama Lengkap" value={pelamar?.nama_lengkap ?? '—'} />
                            <InfoCard label="Alamat Email" value={pelamar?.email ?? '—'} valueClassName="font-mono text-xs" />
                            <InfoCard label="Nomor HP" value={pelamar?.no_telepon ?? '—'} />
                        </div>

                        {/* Page Specific Content */}
                        <div className="kandidat-content-slot">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </HRDLayout>
    );
}
