import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import HRDLayout from '@/Layouts/HRDLayout';

export default function EditLowongan({ lowongan = null, isEdit = false }) {
    // Current wizard step: 1, 2, or 3
    const [currentStep, setCurrentStep] = useState(1);
    const [step1Errors, setStep1Errors] = useState({});
    const [step2Errors, setStep2Errors] = useState({});

    // Form data initialization
    const { data, setData, post, put, processing, errors } = useForm({
        posisi: lowongan?.posisi ?? lowongan?.judul_lowongan ?? '',
        judul_lowongan: lowongan?.judul_lowongan ?? lowongan?.posisi ?? '',
        departemen: lowongan?.departemen ?? '',
        lokasi: lowongan?.lokasi ?? '',
        tipe_pekerjaan: lowongan?.tipe_pekerjaan ?? 'Full-Time',
        gaji_min: lowongan?.gaji_min ? String(Math.round(lowongan.gaji_min)) : '',
        gaji_max: lowongan?.gaji_max ? String(Math.round(lowongan.gaji_max)) : '',
        status_lowongan: lowongan?.status_lowongan ?? 'Aktif',
        tanggal_buka: lowongan?.tanggal_buka ?? new Date().toISOString().split('T')[0],
        tanggal_tutup: lowongan?.tanggal_tutup ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        deskripsi: lowongan?.deskripsi ?? '',
        kualifikasi: lowongan?.kualifikasi ?? '',
    });

    // Step 1 Validation
    const validateStep1 = () => {
        const errs = {};
        if (!data.posisi.trim()) errs.posisi = 'Posisi pekerjaan wajib diisi.';
        if (!data.departemen.trim()) errs.departemen = 'Departemen wajib diisi.';
        if (!data.lokasi.trim()) errs.lokasi = 'Lokasi pekerjaan wajib diisi.';
        if (!data.tanggal_buka) errs.tanggal_buka = 'Tanggal buka wajib diisi.';
        if (!data.tanggal_tutup) errs.tanggal_tutup = 'Tanggal tutup wajib diisi.';

        setStep1Errors(errs);
        return Object.keys(errs).length === 0;
    };

    // Step 2 Validation
    const validateStep2 = () => {
        const errs = {};
        if (!data.deskripsi.trim()) errs.deskripsi = 'Deskripsi lowongan wajib diisi.';
        setStep2Errors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNextToStep2 = (e) => {
        if (e) e.preventDefault();
        if (validateStep1()) {
            setCurrentStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleNextToStep3 = (e) => {
        if (e) e.preventDefault();
        if (validateStep2()) {
            setCurrentStep(3);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Form Submission on Step 3
    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (isEdit && lowongan?.id_lowongan) {
            put(`/hrd/lowongan/${lowongan.id_lowongan}`);
        } else {
            post('/hrd/lowongan');
        }
    };

    // Formatting helpers for Preview
    const formatCurrency = (val) => {
        if (!val) return '0';
        const num = Number(val);
        return isNaN(num) ? val : num.toLocaleString('id-ID');
    };

    const formatDatePreview = (dateStr) => {
        if (!dateStr) return 'HH/BB/TTTT';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    // Calculate active keyword approximation
    const activeKeywordsCount = data.kualifikasi
        ? data.kualifikasi.split('\n').filter((l) => l.trim().length > 0).length + 8
        : 12;

    return (
        <HRDLayout title={isEdit ? 'Edit Lowongan' : 'Buka Lowongan'}>
            <div className="hrd-wizard-container">
                {/* ── Page Title with Line ── */}
                <div className="hrd-page-inline-wrap">
                    <h1 className="hrd-page-inline-title">
                        {isEdit ? 'Edit Lowongan' : 'Buka Lowongan'}
                    </h1>
                    <div className="hrd-page-inline-line"></div>
                </div>

                {/* ── Stepper (1 Basic Info — 2 Description — 3 Review & Publish) ── */}
                <div className="hrd-stepper-wrap">
                    {/* Step 1 */}
                    <div
                        className="hrd-stepper-item cursor-pointer"
                        onClick={() => setCurrentStep(1)}
                    >
                        <div
                            className={`hrd-stepper-box ${
                                currentStep === 1
                                    ? 'hrd-stepper-box--active'
                                    : currentStep > 1
                                    ? 'hrd-stepper-box--completed'
                                    : ''
                            }`}
                        >
                            {currentStep > 1 ? (
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            ) : (
                                '1'
                            )}
                        </div>
                        <span className="hrd-stepper-label">Basic Information</span>
                    </div>

                    {/* Line 1 -> 2 */}
                    <div className="hrd-stepper-connector"></div>

                    {/* Step 2 */}
                    <div
                        className="hrd-stepper-item cursor-pointer"
                        onClick={() => {
                            if (validateStep1()) setCurrentStep(2);
                        }}
                    >
                        <div
                            className={`hrd-stepper-box ${
                                currentStep === 2
                                    ? 'hrd-stepper-box--active'
                                    : currentStep > 2
                                    ? 'hrd-stepper-box--completed'
                                    : ''
                            }`}
                        >
                            {currentStep > 2 ? (
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            ) : (
                                '2'
                            )}
                        </div>
                        <span className="hrd-stepper-label">
                            Description & Requirements
                        </span>
                    </div>

                    {/* Line 2 -> 3 */}
                    <div className="hrd-stepper-connector"></div>

                    {/* Step 3 */}
                    <div
                        className="hrd-stepper-item cursor-pointer"
                        onClick={() => {
                            if (validateStep1() && validateStep2()) setCurrentStep(3);
                        }}
                    >
                        <div
                            className={`hrd-stepper-box ${
                                currentStep === 3 ? 'hrd-stepper-box--active' : ''
                            }`}
                        >
                            3
                        </div>
                        <span className="hrd-stepper-label">Review & Publish</span>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════
                    STEP 1: INFORMASI LOWONGAN (IMAGE 1)
                   ══════════════════════════════════════════════ */}
                {currentStep === 1 && (
                    <div className="hrd-wizard-card">
                        <div className="hrd-wizard-section-head">
                            <h2 className="hrd-wizard-section-title">
                                INFORMASI LOWONGAN
                            </h2>
                            <div className="hrd-wizard-section-line"></div>
                        </div>

                        <div className="hrd-form-two-col">
                            {/* Posisi Pekerjaan */}
                            <div className="hrd-input-group">
                                <label className="hrd-input-label">
                                    Posisi Pekerjaan
                                </label>
                                <input
                                    type="text"
                                    value={data.posisi}
                                    onChange={(e) => setData((prev) => ({
                                        ...prev,
                                        posisi: e.target.value,
                                        judul_lowongan: e.target.value,
                                    }))}
                                    placeholder="Posisi Pekerjaan ..."
                                    className="hrd-input-control"
                                />
                                {(step1Errors.posisi || errors.posisi) && (
                                    <span className="form-error">
                                        {step1Errors.posisi || errors.posisi}
                                    </span>
                                )}
                            </div>

                            {/* Department */}
                            <div className="hrd-input-group">
                                <label className="hrd-input-label">Department</label>
                                <input
                                    type="text"
                                    value={data.departemen}
                                    onChange={(e) =>
                                        setData('departemen', e.target.value)
                                    }
                                    placeholder="Department ..."
                                    className="hrd-input-control"
                                />
                                {(step1Errors.departemen || errors.departemen) && (
                                    <span className="form-error">
                                        {step1Errors.departemen || errors.departemen}
                                    </span>
                                )}
                            </div>

                            {/* Lokasi Pekerjaan */}
                            <div className="hrd-input-group">
                                <label className="hrd-input-label">
                                    Lokasi Pekerjaan
                                </label>
                                <input
                                    type="text"
                                    value={data.lokasi}
                                    onChange={(e) => setData('lokasi', e.target.value)}
                                    placeholder="Lokasi Pekerjaan ..."
                                    className="hrd-input-control"
                                />
                                {(step1Errors.lokasi || errors.lokasi) && (
                                    <span className="form-error">
                                        {step1Errors.lokasi || errors.lokasi}
                                    </span>
                                )}
                            </div>

                            {/* Tipe Lowongan (Toggle Buttons: FULL-TIME / INTERNSHIP/PKL) */}
                            <div className="hrd-input-group">
                                <label className="hrd-input-label">Tipe Lowongan</label>
                                <div className="hrd-toggle-group">
                                    <button
                                        type="button"
                                        onClick={() => setData('tipe_pekerjaan', 'Full-Time')}
                                        className={`hrd-toggle-btn ${
                                            data.tipe_pekerjaan === 'Full-Time'
                                                ? 'hrd-toggle-btn--active'
                                                : 'hrd-toggle-btn--inactive'
                                        }`}
                                    >
                                        FULL-TIME
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData('tipe_pekerjaan', 'Internship/PKL')
                                        }
                                        className={`hrd-toggle-btn ${
                                            data.tipe_pekerjaan === 'Internship/PKL' ||
                                            data.tipe_pekerjaan === 'Magang' ||
                                            data.tipe_pekerjaan === 'PKL'
                                                ? 'hrd-toggle-btn--active'
                                                : 'hrd-toggle-btn--inactive'
                                        }`}
                                    >
                                        INTERNSHIP/PKL
                                    </button>
                                </div>
                            </div>

                            {/* Gaji Pekerjaan (IDR / Bulan) Min & Max */}
                            <div className="hrd-input-group">
                                <label className="hrd-input-label">
                                    Gaji Pekerjaan ( IDR / Bulan )
                                </label>
                                <div className="hrd-range-inputs">
                                    <input
                                        type="number"
                                        value={data.gaji_min}
                                        onChange={(e) => setData('gaji_min', e.target.value)}
                                        placeholder="Min xxxxxxx"
                                        className="hrd-input-control"
                                    />
                                    <input
                                        type="number"
                                        value={data.gaji_max}
                                        onChange={(e) => setData('gaji_max', e.target.value)}
                                        placeholder="Max xxxxxxx"
                                        className="hrd-input-control"
                                    />
                                </div>
                            </div>

                            {/* Status Lowongan */}
                            <div className="hrd-input-group">
                                <label className="hrd-input-label">Status Lowongan</label>
                                <select
                                    value={data.status_lowongan}
                                    onChange={(e) =>
                                        setData('status_lowongan', e.target.value)
                                    }
                                    className="hrd-input-control cursor-pointer"
                                >
                                    <option value="Aktif">Terbuka - Aktif Merekrut</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Tutup">Tutup</option>
                                </select>
                            </div>

                            {/* Tanggal Buka */}
                            <div className="hrd-input-group">
                                <label className="hrd-input-label">Tanggal Buka</label>
                                <input
                                    type="date"
                                    value={data.tanggal_buka}
                                    onChange={(e) =>
                                        setData('tanggal_buka', e.target.value)
                                    }
                                    className="hrd-input-control"
                                />
                                {(step1Errors.tanggal_buka || errors.tanggal_buka) && (
                                    <span className="form-error">
                                        {step1Errors.tanggal_buka || errors.tanggal_buka}
                                    </span>
                                )}
                            </div>

                            {/* Tanggal Tutup */}
                            <div className="hrd-input-group">
                                <label className="hrd-input-label">Tanggal Tutup</label>
                                <input
                                    type="date"
                                    value={data.tanggal_tutup}
                                    onChange={(e) =>
                                        setData('tanggal_tutup', e.target.value)
                                    }
                                    className="hrd-input-control"
                                />
                                {(step1Errors.tanggal_tutup || errors.tanggal_tutup) && (
                                    <span className="form-error">
                                        {step1Errors.tanggal_tutup || errors.tanggal_tutup}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Navigation Footer Step 1 */}
                        <div className="hrd-wizard-footer">
                            <Link
                                href="/hrd/kelola-job"
                                className="hrd-wizard-back-btn"
                            >
                                ← KEMBALI
                            </Link>
                            <button
                                type="button"
                                onClick={handleNextToStep2}
                                className="hrd-wizard-forward-btn"
                            >
                                LANJUT KE DESKRIPSI →
                            </button>
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════
                    STEP 2: DESKRIPSI LOWONGAN (IMAGE 2)
                   ══════════════════════════════════════════════ */}
                {currentStep === 2 && (
                    <div className="hrd-wizard-card">
                        <div className="hrd-wizard-section-head">
                            <h2 className="hrd-wizard-section-title">
                                DESKRIPSI LOWONGAN
                            </h2>
                            <div className="hrd-wizard-section-line"></div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <textarea
                                rows={12}
                                value={data.deskripsi}
                                onChange={(e) => setData('deskripsi', e.target.value)}
                                placeholder="Tuliskan deskripsi lengkap dan persyaratan kualifikasi pekerjaan..."
                                className="hrd-textarea-large"
                            ></textarea>
                            {(step2Errors.deskripsi || errors.deskripsi) && (
                                <span className="form-error">
                                    {step2Errors.deskripsi || errors.deskripsi}
                                </span>
                            )}
                        </div>

                        {/* Navigation Footer Step 2 */}
                        <div className="hrd-wizard-footer">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(1)}
                                className="hrd-wizard-back-btn"
                            >
                                ← KEMBALI KE INFORMASI
                            </button>
                            <button
                                type="button"
                                onClick={handleNextToStep3}
                                className="hrd-wizard-forward-btn"
                            >
                                LANJUT KE REVIEW →
                            </button>
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════
                    STEP 3: REVIEW & PUBLISH (IMAGE 3)
                   ══════════════════════════════════════════════ */}
                {currentStep === 3 && (
                    <div className="hrd-wizard-card">
                        {/* Section Header: PREVIEW POST [DRAFT] */}
                        <div className="hrd-wizard-section-head justify-between">
                            <div className="hrd-wizard-title-group">
                                <h2 className="hrd-wizard-section-title">
                                    PREVIEW POST
                                </h2>
                                <div className="hrd-wizard-section-line"></div>
                            </div>
                            <span className="hrd-wizard-status-tag">
                                {data.status_lowongan === 'Draft' ? 'DRAFT' : 'AKTIF'}
                            </span>
                        </div>

                        {/* Preview Post Card */}
                        <div className="hrd-preview-post-card">
                            <div className="hrd-preview-header-line">
                                <h3 className="hrd-preview-title">
                                    [ {(data.judul_lowongan || data.posisi) ? (data.judul_lowongan || data.posisi).toUpperCase() : 'JUDUL POSISI'} ]
                                </h3>
                                <span className="hrd-job-type-outline font-bold">
                                    [ {data.tipe_pekerjaan ? data.tipe_pekerjaan.toUpperCase() : 'FULL-TIME'} ]
                                </span>
                            </div>

                            <div className="hrd-preview-submeta">
                                [ {data.departemen ? data.departemen.toUpperCase() : 'DEPARTMENT'} ] • [ {data.lokasi ? data.lokasi.toUpperCase() : 'LOKASI'} ] • {data.tipe_pekerjaan ? data.tipe_pekerjaan.toUpperCase() : 'FULL-TIME'}
                            </div>

                            <div className="hrd-preview-body-content">
                                {data.deskripsi ||
                                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}
                            </div>

                            {/* Bottom Chips: [RESUME WAJIB] [IDR [MIN] - [MAX]] [BATAS: [DATETIME]] */}
                            <div className="hrd-preview-badge-row">
                                <span className="hrd-preview-pill-badge">
                                    [ RESUME WAJIB ]
                                </span>
                                <span className="hrd-preview-pill-badge">
                                    IDR {formatCurrency(data.gaji_min)} - {formatCurrency(data.gaji_max)}
                                </span>
                                <span className="hrd-preview-pill-badge">
                                    BATAS: {formatDatePreview(data.tanggal_tutup)}
                                </span>
                            </div>
                        </div>

                        {/* Section Header: KONFIGURASI ATS */}
                        <div className="hrd-wizard-section-head mt-8">
                            <h2 className="hrd-wizard-section-title">
                                KONFIGURASI ATS
                            </h2>
                            <div className="hrd-wizard-section-line"></div>
                        </div>

                        {/* ATS Stats Grid (60% SKOR MINIMUM | 40% AUTO REJECT | XX Keyword) */}
                        <div className="hrd-ats-section-card">
                            <div className="hrd-ats-grid-3col">
                                <div className="hrd-ats-metric">
                                    <div className="hrd-ats-number">60%</div>
                                    <div className="hrd-ats-sub">SKOR MINIMUM</div>
                                </div>
                                <div className="hrd-ats-metric">
                                    <div className="hrd-ats-number">40%</div>
                                    <div className="hrd-ats-sub">
                                        AUTO REJECT DI BAWAH
                                    </div>
                                </div>
                                <div className="hrd-ats-metric">
                                    <div className="hrd-ats-number">
                                        {activeKeywordsCount} Keyword
                                    </div>
                                    <div className="hrd-ats-sub">
                                        KATA KUNCI AKTIF
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Footer Step 3 */}
                        <div className="hrd-wizard-footer">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(2)}
                                className="hrd-wizard-back-btn"
                            >
                                ← KEMBALI KE DESKRIPSI
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={processing}
                                className="hrd-wizard-forward-btn"
                            >
                                {processing
                                    ? 'MENYIMPAN...'
                                    : isEdit
                                    ? 'EDIT LOWONGAN'
                                    : 'PUBLISH LOWONGAN'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </HRDLayout>
    );
}
