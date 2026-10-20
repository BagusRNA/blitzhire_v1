import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import PelamarModal from '@/Components/PelamarModal';
import InfoCard from '@/Components/InfoCard';

export default function PelamarLayout({ title, children }) {
    const { url, props } = usePage();
    const user = props?.auth?.user;
    const email = user?.email ?? 'USER@example.com';

    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showDocsModal, setShowDocsModal] = useState(false);

    const handleLogout = () => {
        router.post('/kandidat/logout');
    };

    const sidebarItems = [
        { label: 'Dashboard', href: '/pelamar/dashboard', active: true },
    ];

    return (
        <div className="pelamar-shell">
            {title && <Head title={`${title} — Cybers Blitz Nusantara`} />}

            {/* ══ TOPBAR (HEADER) ══ */}
            <header className="hrd-topbar">
                {/* Logo & Brand */}
                <Link href="/" className="hrd-topbar-brand group">
                    <svg width="36" height="36" viewBox="0 0 100 100" fill="none" className="flex-shrink-0 transition-transform group-hover:scale-105">
                        <path d="M10,85 L35,35 L60,85 Z" fill="#FF7200"/>
                        <path d="M40,15 L90,15 L65,65 Z" fill="#9A0036"/>
                        <path d="M30,30 L55,80 L75,40 L50,90 Z" fill="#1C2434"/>
                    </svg>
                    <div className="portal-brand-text">
                        <span>Cybers Blitz</span>
                        <span>Nusantara</span>
                    </div>
                </Link>

                {/* Top Right Nav */}
                <nav className="hrd-topbar-nav">
                    <Link
                        href="/"
                        className={`hrd-topbar-link ${url === '/' ? 'hrd-topbar-link--active' : ''}`}
                    >
                        Home
                    </Link>
                    <Link
                        href="/jobs"
                        className={`hrd-topbar-link ${url.startsWith('/jobs') ? 'font-bold text-black' : ''}`}
                    >
                        Explore Jobs
                    </Link>

                    {/* Pelamar Badge */}
                    <div className="portal-user-badge">
                        <div className="portal-user-badge-icon"></div>
                        <span className="font-semibold text-xs text-gray-900 tracking-wide">
                            {user?.nama_lengkap ? user.nama_lengkap.split(' ')[0] : 'Pelamar'}
                        </span>
                    </div>
                </nav>
            </header>

            {/* ══ BODY WRAPPER (SIDEBAR + MAIN CONTENT) ══ */}
            <div className="pelamar-body-wrapper">

                {/* ── LEFT SIDEBAR ── */}
                <aside className="pelamar-sidebar">
                    <div>
                        {/* User Profile Info Box */}
                        <div className="pelamar-user-box">
                            <div className="pelamar-avatar">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-gray-700">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                            <div className="pelamar-user-meta">
                                <p className="pelamar-email" title={email}>
                                    {email}
                                </p>
                            </div>
                        </div>

                        {/* Navigation Buttons for Candidate */}
                        <nav className="pelamar-nav-list">
                            {sidebarItems.map((item, idx) => {
                                const isActive = item.active;
                                if (isActive) {
                                    return (
                                        <div
                                            key={idx}
                                            className="hrd-nav-item hrd-nav-item--active"
                                        >
                                            {item.label}
                                        </div>
                                    );
                                }
                                if (item.action) {
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={item.action}
                                            className="hrd-nav-item cursor-pointer"
                                        >
                                            {item.label}
                                        </button>
                                    );
                                }
                                return (
                                    <Link
                                        key={idx}
                                        href={item.href}
                                        className="hrd-nav-item"
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Logout Button */}
                    <div className="hrd-sidebar-footer">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="hrd-logout-btn cursor-pointer"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
                                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                            </svg>
                            LOG OUT
                        </button>
                    </div>
                </aside>

                {/* ── MAIN CONTENT ── */}
                <main className="pelamar-content-main">
                    {children}
                </main>
            </div>

            {/* ══ FOOTER ══ */}
            <footer className="portal-footer">
                <div className="portal-footer-inner">
                    <div className="pelamar-footer-brand">
                        <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
                            <path d="M10,85 L35,35 L60,85 Z" fill="#FF7200"/>
                            <path d="M40,15 L90,15 L65,65 Z" fill="#9A0036"/>
                        </svg>
                        <span className="pelamar-footer-brand-text">Cybers Blitz Nusantara &nbsp;•&nbsp; 20XX</span>
                    </div>
                    <a
                        href="mailto:contact@cybersblitz.id"
                        className="pelamar-footer-contact"
                    >
                        CONTACT US
                    </a>
                </div>
            </footer>

            {/* ══ MODAL PROFIL SAYA ══ */}
            <PelamarModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                title="Profil Kandidat"
            >
                <div className="pelamar-modal-body">
                    <InfoCard
                        label="Nama Lengkap"
                        value={user?.nama_lengkap || '-'}
                    />
                    <InfoCard
                        label="Email"
                        value={user?.email || '-'}
                        valueClassName="font-mono text-xs"
                    />
                    <div className="pelamar-modal-grid-2">
                        <InfoCard
                            label="Nomor WhatsApp / HP"
                            value={user?.nomor_hp || '-'}
                        />
                        <InfoCard
                            label="Pendidikan Terakhir"
                            value={user?.pendidikan_terakhir || '-'}
                        />
                    </div>
                    <InfoCard
                        label="Alamat Domisili"
                        value={user?.alamat || '-'}
                    />
                </div>
                <div className="pelamar-modal-footer">
                    <button
                        type="button"
                        onClick={() => setShowProfileModal(false)}
                        className="btn-primary-sm"
                    >
                        Tutup
                    </button>
                </div>
            </PelamarModal>

            {/* ══ MODAL DOKUMEN SAYA ══ */}
            <PelamarModal
                isOpen={showDocsModal}
                onClose={() => setShowDocsModal(false)}
                title="Berkas & Dokumen Saya"
            >
                <div className="pelamar-modal-body">
                    <p className="pelamar-modal-desc">
                        Dokumen lampiran (CV / Resume, Portofolio, Ijazah, dan Sertifikat) dikelola dan diunggah pada masing-masing tahapan lamaran di halaman Dashboard.
                    </p>
                    <div className="card-base-sm">
                        <span className="pelamar-modal-strong">Status Kelengkapan Dokumen:</span>
                        <p className="pelamar-modal-subtext">
                            Pastikan berkas dokumen yang Anda unggah berformat PDF atau gambar (maksimal 5MB) dan terbaca dengan jelas untuk mempercepat proses screening oleh HRD.
                        </p>
                    </div>
                </div>
                <div className="pelamar-modal-footer">
                    <button
                        type="button"
                        onClick={() => setShowDocsModal(false)}
                        className="btn-primary-sm"
                    >
                        Mengerti
                    </button>
                </div>
            </PelamarModal>
        </div>
    );
}
