import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';

export default function LandingPage({ stats = {}, recentJobs = [] }) {
    return (
        <div className="landing-wrapper">
            <Head title="Careers — Cybers Blitz Nusantara" />

            {/* Header / Navbar (TETAP SESUAI ASLINYA) */}
            <Header />

            <main className="landing-main">
                {/* 1. Hero Section */}
                <section className="landing-hero-section">
                    <div className="landing-hero-grid">
                        {/* Hero Left Content */}
                        <div className="landing-hero-left">
                            <span className="landing-eyebrow">
                                CYBERS BLITZ NUSANTARA — CAREERS
                            </span>

                            <h1 className="landing-hero-title">
                                Bangun Karir Anda<br />
                                Bersama Kami
                            </h1>

                            <p className="landing-hero-desc">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                            </p>

                            {/* Hero Action Buttons */}
                            <div className="landing-btn-group">
                                <Link
                                    href="/jobs"
                                    className="landing-btn-primary"
                                >
                                    <span>LIHAT LOWONGAN</span>
                                    <span className="landing-btn-arrow">&rarr;</span>
                                </Link>

                                <Link
                                    href="/login"
                                    className="landing-btn-outline"
                                >
                                    SIGN IN / REGISTER
                                </Link>
                            </div>

                            {/* Hero Stats */}
                            <div className="landing-stats-row">
                                <div className="landing-stat-item">
                                    <div className="landing-stat-divider"></div>
                                    <div>
                                        <div className="landing-stat-val">
                                            5X +
                                        </div>
                                        <div className="landing-stat-lbl">
                                            OPEN POSITIONS
                                        </div>
                                    </div>
                                </div>

                                <div className="landing-stat-item">
                                    <div className="landing-stat-divider"></div>
                                    <div>
                                        <div className="landing-stat-val">
                                            5X.XXX +
                                        </div>
                                        <div className="landing-stat-lbl">
                                            APPLICANTS PLACED
                                        </div>
                                    </div>
                                </div>

                                <div className="landing-stat-item">
                                    <div className="landing-stat-divider"></div>
                                    <div>
                                        <div className="landing-stat-val">
                                            XX%
                                        </div>
                                        <div className="landing-stat-lbl">
                                            OFFER ACCEPTANCE RATE
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hero Right Image */}
                        <div className="landing-hero-right">
                            <div className="landing-hero-img-box">
                                <img
                                    src="/images/hero-team.jpg"
                                    alt="Cybers Blitz Nusantara Careers - Team Collaboration"
                                    className="landing-hero-img"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Cara Kerja / Proses Rekrutmen Kami */}
                <section className="landing-process-section">
                    <div className="landing-section-header">
                        <span className="landing-section-eyebrow">
                            CARA KERJA
                        </span>
                        <h2 className="landing-section-title">
                            Proses Rekrutmen Kami
                        </h2>
                        <div className="landing-title-underline"></div>
                    </div>

                    <div className="landing-process-grid">
                        {/* Card 1 */}
                        <div className="landing-process-card">
                            <div>
                                <div className="landing-process-badge">
                                    1
                                </div>
                                <h3 className="landing-process-card-title">
                                    Daftar Online
                                </h3>
                                <p className="landing-process-card-desc">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                                </p>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="landing-process-card">
                            <div>
                                <div className="landing-process-badge">
                                    2
                                </div>
                                <h3 className="landing-process-card-title">
                                    Screening Pintar
                                </h3>
                                <p className="landing-process-card-desc">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                                </p>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="landing-process-card">
                            <div>
                                <div className="landing-process-badge">
                                    3
                                </div>
                                <h3 className="landing-process-card-title">
                                    Wawancara
                                </h3>
                                <p className="landing-process-card-desc">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Call to Action / Explore Section */}
                <section className="landing-roles-section">
                    <div className="landing-roles-topbar">
                        <div>
                            <h2 className="landing-roles-title">
                                Siap menjelajahi posisi yang tersedia?
                            </h2>
                            <p className="landing-roles-desc">
                                Kami memiliki posisi full-time dan magang (PKL) yang tersedia di berbagai bidang, termasuk Engineering, Design, Product, dan lainnya.
                            </p>
                        </div>

                        <Link
                            href="/jobs"
                            className="landing-roles-btn"
                        >
                            <span>LIHAT LOWONGAN KERJA</span>
                            <span className="landing-btn-arrow">&rarr;</span>
                        </Link>
                    </div>

                    <div className="landing-roles-grid">
                        {/* Card: Full-Time Roles */}
                        <Link
                            href="/jobs?type=Full-Time"
                            className="landing-role-card"
                        >
                            <div className="landing-role-icon-box landing-role-icon-box--solid">
                                <div className="landing-role-icon-inner-solid"></div>
                            </div>
                            <div className="landing-role-body">
                                <div className="landing-role-header">
                                    <h3 className="landing-role-name">
                                        Full-Time Roles
                                    </h3>
                                    <span className="landing-role-badge-solid">
                                        XX TERSEDIA
                                    </span>
                                </div>
                                <p className="landing-role-info">
                                    Posisi tetap dengan tunjangan lengkap, program orientasi, dan jalur pengembangan karier.
                                </p>
                            </div>
                        </Link>

                        {/* Card: Internship/PKL Roles */}
                        <Link
                            href="/jobs?type=Internship/PKL"
                            className="landing-role-card"
                        >
                            <div className="landing-role-icon-box landing-role-icon-box--outline">
                                <div className="landing-role-icon-inner-outline"></div>
                            </div>
                            <div className="landing-role-body">
                                <div className="landing-role-header">
                                    <h3 className="landing-role-name">
                                        Internship/PKL Roles
                                    </h3>
                                    <span className="landing-role-badge-outline">
                                        XX TERSEDIA
                                    </span>
                                </div>
                                <p className="landing-role-info">
                                    Program terstruktur berdurasi 3–6 bulan bagi mahasiswa. Dokumen akademik diperlukan.
                                </p>
                            </div>
                        </Link>
                    </div>
                </section>
            </main>

            {/* Footer (TETAP SESUAI ASLINYA) */}
            <Footer />
        </div>
    );
}
