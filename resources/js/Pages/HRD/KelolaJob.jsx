import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import HRDLayout from '@/Layouts/HRDLayout';

export default function KelolaJob({ jobs = [], filters = {} }) {
    const { flash = {} } = usePage().props;
    const [keyword, setKeyword] = useState(filters.keyword || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'Semua');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'Semua');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [deleteModalJob, setDeleteModalJob] = useState(null);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        router.get(
            '/hrd/kelola-job',
            {
                keyword: keyword || undefined,
                status: statusFilter !== 'Semua' ? statusFilter : undefined,
                type: typeFilter !== 'Semua' ? typeFilter : undefined,
            },
            { preserveState: true }
        );
    };

    const handleResetFilter = () => {
        setKeyword('');
        setStatusFilter('Semua');
        setTypeFilter('Semua');
        setShowFilterDropdown(false);
        router.get('/hrd/kelola-job', {}, { preserveState: true });
    };

    const confirmDelete = () => {
        if (!deleteModalJob) return;
        router.delete(`/hrd/lowongan/${deleteModalJob.id_lowongan}`, {
            onSuccess: () => setDeleteModalJob(null),
        });
    };

    const formatPostedTime = (dateString, createdAt) => {
        const d = dateString || createdAt;
        if (!d) return 'Baru saja';
        try {
            const date = new Date(d);
            const now = new Date();
            const diffMs = now - date;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffHours / 24);

            if (diffHours < 1) return 'Posted Just Now';
            if (diffHours < 24) return `Posted ${diffHours} Hours Ago`;
            if (diffDays === 1) return 'Posted Yesterday';
            if (diffDays < 30) return `Posted ${diffDays} Days Ago`;
            return `Posted ${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
        } catch {
            return 'Posted recently';
        }
    };

    return (
        <HRDLayout title="Kelola Job">
            <div className="hrd-jobpage">
                {/* ── Header with Underline ── */}
                <div className="hrd-page-inline-wrap">
                    <h1 className="hrd-page-inline-title">Kelola Job</h1>
                    <div className="hrd-page-inline-line"></div>
                </div>

                {/* Flash Message */}
                {flash.success && (
                    <div className="hrd-flash-success flex items-center justify-between">
                        <span>{flash.success}</span>
                        <button
                            type="button"
                            onClick={() => router.reload()}
                            className="text-xs font-bold text-green-800 uppercase ml-3"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* ── Toolbar: Filter, Keyword, Search, Buka Lowongan + ── */}
                <div className="hrd-job-toolbar">
                    <form onSubmit={handleSearch} className="hrd-job-toolbar-left relative">
                        {/* Filter Toggle Button */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                className="hrd-filter-btn"
                            >
                                <span>Filter</span>
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>

                            {/* Dropdown Options */}
                            {showFilterDropdown && (
                                <div className="hrd-filter-dropdown-menu">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                                        Status Lowongan
                                    </div>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="hrd-filter-select text-xs py-1.5"
                                    >
                                        <option value="Semua">Semua Status</option>
                                        <option value="Aktif">Aktif</option>
                                        <option value="Draft">Draft</option>
                                        <option value="Tutup">Tutup</option>
                                    </select>

                                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-2 mb-1">
                                        Tipe Pekerjaan
                                    </div>
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className="hrd-filter-select text-xs py-1.5"
                                    >
                                        <option value="Semua">Semua Tipe</option>
                                        <option value="Full-Time">Full-Time</option>
                                        <option value="Internship/PKL">Internship / PKL</option>
                                    </select>

                                    <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={handleResetFilter}
                                            className="text-xs text-gray-500 hover:text-black"
                                        >
                                            Reset
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowFilterDropdown(false);
                                                handleSearch();
                                            }}
                                            className="btn-primary-sm py-1 px-3 text-[10px]"
                                        >
                                            Terapkan
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Keyword Search Input */}
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Keyword"
                            className="hrd-jobsearch-input"
                        />

                        {/* Filter Button */}
                        <button type="submit" className="hrd-filter-submit-btn">
                            Filter
                        </button>
                    </form>

                    {/* Buka Lowongan + Button */}
                    <Link
                        href="/hrd/lowongan/create"
                        className="hrd-buka-lowongan-btn"
                    >
                        BUKA LOWONGAN +
                    </Link>
                </div>

                {/* ── Job Postings List ── */}
                <div className="hrd-job-list mt-3">
                    {jobs && jobs.length > 0 ? (
                        jobs.map((job) => {
                            const isInternship =
                                (job.tipe_pekerjaan &&
                                    job.tipe_pekerjaan.toLowerCase().includes('intern')) ||
                                (job.tipe_pekerjaan &&
                                    job.tipe_pekerjaan.toLowerCase().includes('pkl')) ||
                                (job.tipe_pekerjaan &&
                                    job.tipe_pekerjaan.toLowerCase().includes('magang'));

                            const isDraft =
                                job.status_lowongan &&
                                job.status_lowongan.toLowerCase() === 'draft';

                            return (
                                <div key={job.id_lowongan} className="hrd-job-card">
                                    {/* Grey Thumb Icon Placeholder */}
                                    <div className="hrd-job-thumb-icon">
                                        <svg
                                            width="22"
                                            height="22"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-white"
                                        >
                                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                        </svg>
                                    </div>

                                    {/* Job Main Details */}
                                    <div className="hrd-job-details">
                                        <div className="hrd-job-heading">
                                            <span className="hrd-job-title-text">
                                                {job.judul_lowongan || job.posisi}
                                            </span>

                                            {/* Type Badge */}
                                            {isInternship ? (
                                                <span className="hrd-job-type-solid">
                                                    [ INTERNSHIP ]
                                                </span>
                                            ) : (
                                                <span className="hrd-job-type-outline">
                                                    [ {job.tipe_pekerjaan || 'Full-Time'} ]
                                                </span>
                                            )}

                                            {/* Draft Badge if draft */}
                                            {isDraft && (
                                                <span className="hrd-job-draft-tag">
                                                    <span className="hrd-job-draft-icon">
                                                        -
                                                    </span>
                                                    Draft
                                                </span>
                                            )}
                                        </div>

                                        {/* Sub Metadata line */}
                                        <div className="hrd-job-submeta">
                                            <span>&gt; {job.departemen || 'General'}</span>
                                            <span>&gt; {job.lokasi || 'Indonesia'}</span>
                                            <span>
                                                {formatPostedTime(job.tanggal_buka, job.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Icons (Delete, Edit, View) */}
                                    <div className="hrd-job-btn-actions">
                                        {/* Delete Icon */}
                                        <button
                                            type="button"
                                            onClick={() => setDeleteModalJob(job)}
                                            className="hrd-job-icon-btn"
                                            title="Hapus Lowongan"
                                            aria-label="Delete lowongan"
                                        >
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                        </button>

                                        {/* Edit Icon */}
                                        <Link
                                            href={`/hrd/lowongan/${job.id_lowongan}/edit`}
                                            className="hrd-job-icon-btn"
                                            title="Edit Lowongan"
                                            aria-label="Edit lowongan"
                                        >
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                        </Link>

                                        {/* View / Preview Icon */}
                                        <Link
                                            href={`/jobs/${job.id_lowongan}`}
                                            className="hrd-job-icon-btn"
                                            title="Lihat Detail Lowongan"
                                            aria-label="View lowongan"
                                        >
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <circle cx="12" cy="12" r="3"></circle>
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="card-base text-center py-12 text-gray-500">
                            <p className="font-semibold text-base mb-1">
                                Belum ada lowongan yang sesuai kriteria filter.
                            </p>
                            <p className="text-xs text-gray-400 mb-4">
                                Silakan ubah filter atau klik tombol di bawah untuk membuat lowongan baru.
                            </p>
                            <Link
                                href="/hrd/lowongan/create"
                                className="btn-primary-sm py-2 px-5 inline-block"
                            >
                                + Buka Lowongan Baru
                            </Link>
                        </div>
                    )}
                </div>

                {/* ── Delete Confirmation Modal ── */}
                {deleteModalJob && (
                    <div className="modal-backdrop-dark">
                        <div className="modal-card-base">
                            <div className="modal-header-line">
                                <h3 className="modal-header-title">Hapus Lowongan</h3>
                                <button
                                    onClick={() => setDeleteModalJob(null)}
                                    className="modal-header-close"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="py-2">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    Apakah Anda yakin ingin menghapus lowongan{' '}
                                    <strong className="text-black font-bold">
                                        "{deleteModalJob.judul_lowongan || deleteModalJob.posisi}"
                                    </strong>
                                    ? Data lamaran terkait lowongan ini juga akan terhapus.
                                </p>
                            </div>
                            <div className="flex justify-end gap-3 pt-5 mt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setDeleteModalJob(null)}
                                    className="btn-secondary-sm py-2 px-4"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDelete}
                                    className="btn-danger py-2 px-4 text-xs font-bold"
                                >
                                    Hapus Sekarang
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </HRDLayout>
    );
}
