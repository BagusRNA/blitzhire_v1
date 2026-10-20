import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

export default function HRDLayout({ title, children }) {
    const { url, props } = usePage();
    const user = props?.auth?.user;
    const email = user?.email ?? 'HRD@example.com';

    const handleLogout = () => {
        router.post('/hrd-login/logout');
    };

    const navItems = [
        { label: 'Dashboard',             href: '/hrd/dashboard',              match: '/hrd/dashboard' },
        { label: 'Manajemen Kandidat',    href: '/hrd/manajemen-kandidat',     match: '/hrd/manajemen-kandidat' },
        { label: 'Manajemen Data',        href: '/hrd/manajemen-data',         match: '/hrd/manajemen-data' },
        { label: 'Kelola Job',            href: '/hrd/kelola-job',             match: '/hrd/kelola-job' },
        { label: 'Konfigurasi Penilaian', href: '/hrd/konfigurasi-penilaian',  match: '/hrd/konfigurasi-penilaian' },
    ];

    return (
        <div className="hrd-shell">
            {title && <Head title={`${title} — BlitzHire HRD`} />}

            {/* ══ SIDEBAR ══ */}
            <aside className="hrd-sidebar">

                {/* 1. Logo brand di atas sidebar */}
                <div className="hrd-sidebar-logo">
                    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" className="flex-shrink-0">
                        <path d="M10,85 L35,35 L60,85 Z" fill="#FF7200"/>
                        <path d="M40,15 L90,15 L65,65 Z" fill="#9A0036"/>
                        <path d="M30,30 L55,80 L75,40 L50,90 Z" fill="#1C2434"/>
                    </svg>
                    <div className="hrd-sidebar-logo-text">
                        <span>Cybers Blitz</span>
                        <span>Nusantara</span>
                    </div>
                </div>

                {/* 2. Avatar + email */}
                <div className="hrd-sidebar-user">
                    <div className="hrd-sidebar-avatar"></div>
                    <span className="hrd-sidebar-email">{email}</span>
                </div>

                {/* 3. Nav items */}
                <nav className="hrd-sidebar-nav">
                    {navItems.map(item => {
                        const active = url.startsWith(item.match) || (item.href === '/hrd/kelola-job' && url.startsWith('/hrd/lowongan'));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`hrd-nav-item ${active ? 'hrd-nav-item--active' : ''}`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* 4. Logout di bawah */}
                <div className="hrd-sidebar-footer">
                    <button onClick={handleLogout} className="hrd-logout-btn">
                        {/* Warning triangle icon */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
                            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                        </svg>
                        LOG OUT
                    </button>
                </div>
            </aside>

            {/* ══ MAIN AREA ══ */}
            <div className="hrd-main-area">

                {/* Top header — hanya nav kanan */}
                <header className="hrd-topbar">
                    {/* Kosong di kiri supaya nav tetap di kanan */}
                    <div />
                    <nav className="hrd-topbar-nav">
                        <Link
                            href="/"
                            className={`hrd-topbar-link ${url === '/' ? 'hrd-topbar-link--active' : ''}`}
                        >
                            Home
                        </Link>
                        <Link
                            href="/jobs"
                            className={`hrd-topbar-link ${url.startsWith('/jobs') ? 'hrd-topbar-link--active' : ''}`}
                        >
                            Explore Jobs
                        </Link>
                        <div className="hrd-topbar-user">
                            <div className="hrd-topbar-user-icon"></div>
                            <span>Admin/HRD</span>
                        </div>
                    </nav>
                </header>

                {/* Page content */}
                <main className="hrd-content">
                    {children}
                </main>

                {/* Footer */}
                <footer className="hrd-footer">
                    <div className="hrd-footer-inner">
                        <div className="flex items-center gap-2">
                            <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
                                <path d="M10,85 L35,35 L60,85 Z" fill="#FF7200"/>
                                <path d="M40,15 L90,15 L65,65 Z" fill="#9A0036"/>
                            </svg>
                            <span>Cybers Blitz Nusantara &nbsp;•&nbsp; 20XX</span>
                        </div>
                        <a href="mailto:contact@cybersblitz.id" className="hrd-footer-link">CONTACT US</a>
                    </div>
                </footer>
            </div>
        </div>
    );
}
