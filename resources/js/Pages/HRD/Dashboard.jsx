import React from 'react';
import { Head, Link } from '@inertiajs/react';
import HRDLayout from '@/Layouts/HRDLayout';

export default function HRDDashboard({ stats, recentApplications }) {
    const {
        lowongan_aktif = 0,
        lowongan_fulltime = 0,
        lowongan_magang = 0,
        total_pelamar = 0,
        pelamar_baru_bulan_ini = 0,
        wawancara_hari_ini = 0,
        wawancara_terdekat = null,
    } = stats || {};

    return (
        <HRDLayout title="Dashboard">
            <div className="hrd-page-section">
                <div className="hrd-section-label">DASHBOARD</div>

                {/* ── Stats Cards ── */}
                <div className="hrd-stats-grid">
                    {/* Lowongan Terbuka */}
                    <div className="hrd-stat-card">
                        <div className="hrd-stat-label">LOWONGAN TERBUKA</div>
                        <div className="hrd-stat-value">{lowongan_aktif}<span className="hrd-stat-x">X</span></div>
                        <div className="hrd-stat-sub">
                            {lowongan_fulltime}X Full-Time &nbsp;&nbsp; {lowongan_magang}X Internship/PKL
                        </div>
                    </div>

                    {/* Total Pelamar */}
                    <div className="hrd-stat-card">
                        <div className="hrd-stat-label">TOTAL PELAMAR</div>
                        <div className="hrd-stat-value">{total_pelamar}<span className="hrd-stat-x">X</span></div>
                        <div className="hrd-stat-sub">
                            {pelamar_baru_bulan_ini}X Baru Bulan ini
                        </div>
                    </div>

                    {/* Wawancara Hari Ini */}
                    <div className="hrd-stat-card">
                        <div className="hrd-stat-label">WAWANCARA HARI INI</div>
                        <div className="hrd-stat-value">{wawancara_hari_ini}<span className="hrd-stat-x">X</span></div>
                        <div className="hrd-stat-sub">
                            {wawancara_terdekat
                                ? `Terdekat di jam ${wawancara_terdekat} WIB`
                                : 'Tidak ada jadwal hari ini'}
                        </div>
                    </div>
                </div>

                {/* ── Recent Submissions ── */}
                <div className="hrd-table-section">
                    <div className="hrd-table-section-label">SUBMISI PELAMAR TERBARU</div>
                    <table className="hrd-table">
                        <thead className="hrd-table-head">
                            <tr>
                                <th className="hrd-table-th">REF</th>
                                <th className="hrd-table-th">NAMA PELAMAR</th>
                                <th className="hrd-table-th">POSISI LAMARAN</th>
                                <th className="hrd-table-th">SKOR ATS</th>
                                <th className="hrd-table-th">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="hrd-table-body">
                            {recentApplications && recentApplications.length > 0 ? (
                                recentApplications.map((app, i) => (
                                    <tr key={app.id_lamaran} className="hrd-table-tr">
                                        <td className="hrd-table-td hrd-table-ref">
                                            #{String(app.id_lamaran).padStart(4, '0')}
                                        </td>
                                        <td className="hrd-table-td hrd-table-name">
                                            {app.pelamar?.nama_lengkap ?? '—'}
                                        </td>
                                        <td className="hrd-table-td">
                                            {app.lowongan?.judul_lowongan ?? app.lowongan?.posisi ?? '—'}
                                        </td>
                                        <td className="hrd-table-td">
                                            <span className="hrd-ats-badge">
                                                ATS {app.skor_kecocokan ?? '—'}%
                                            </span>
                                        </td>
                                        <td className="hrd-table-td">
                                            <Link
                                                href={`/hrd/manajemen-kandidat`}
                                                className="hrd-open-details-link"
                                            >
                                                Open Details →
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="hrd-table-empty">
                                        Belum ada pelamar terbaru.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </HRDLayout>
    );
}
