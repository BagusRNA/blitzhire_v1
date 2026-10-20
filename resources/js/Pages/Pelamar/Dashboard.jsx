import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import PelamarLayout from '@/Layouts/PelamarLayout';
import InfoCard from '@/Components/InfoCard';
import StatusBadge from '@/Components/StatusBadge';
import SectionHeader from '@/Components/SectionHeader';
import PelamarModal from '@/Components/PelamarModal';

export default function Dashboard({ lamarans, lamaran }) {
    const { flash } = usePage().props;
    const applications = lamarans || lamaran || [];

    // State for selected application card
    const [selectedId, setSelectedId] = useState(applications[0]?.id_lamaran || null);

    // State for viewing a specific stage in the stepper (null = current active stage)
    const [selectedStageIndex, setSelectedStageIndex] = useState(null);

    // Reschedule form state
    const [isRescheduling, setIsRescheduling] = useState(false);
    const [rescheduleForm, setRescheduleForm] = useState({
        tanggal_baru: '',
        waktu_baru: '',
        alasan: ''
    });

    // Modal state for docs
    const [uploadModal, setUploadModal] = useState({ open: false, lamaranId: null, docType: 'KTP', file: null });

    const activeApp = applications.find(a => a.id_lamaran === selectedId) || applications[0] || null;

    // Helper: Indonesian Month names
    const indonesianMonths = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const formatIndoDate = (dateStr) => {
        if (!dateStr) return '02 Agustus 2026';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            const day = String(d.getDate()).padStart(2, '0');
            const month = indonesianMonths[d.getMonth()];
            const year = d.getFullYear();
            return `${day} ${month} ${year}`;
        } catch {
            return dateStr;
        }
    };

    const formatInterviewTime = (dateStr) => {
        if (!dateStr) return '10.00 - 11.00 WIB';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return '10.00 - 11.00 WIB';
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const endHour = String((d.getHours() + 1) % 24).padStart(2, '0');
            return `${hours}.${minutes} - ${endHour}.${minutes} WIB`;
        } catch {
            return '10.00 - 11.00 WIB';
        }
    };

    const formatRefNo = (id) => {
        if (!id) return '#0001';
        return `#${String(id).padStart(4, '0')}`;
    };

    const stepperSteps = [
        'Lamaran Diterima',
        'Screening',
        'Wawancara',
        'Penawaran',
        'Dokumen Tambahan',
        'Surat Keputusan',
    ];

    // Stage calculations for Stepper
    // Stepper stages:
    // 0: Lamaran Diterima
    // 1: Screening
    // 2: Wawancara
    // 3: Penawaran
    // 4: Dokumen Tambahan
    // 5: Surat Keputusan
    const getStageIndex = (app) => {
        if (!app) return 0;
        const status = (app.status_lamaran || '').toLowerCase();
        if (status.includes('diterima') || status.includes('hired')) return 5;
        if (status.includes('ditolak')) {
            if (app.penawaran && app.penawaran.length > 0) return 5;
            if (app.wawancara && app.wawancara.length > 0) return 2;
            return 1;
        }
        if (status.includes('dokumen')) return 4;
        if (status.includes('penawaran') || status.includes('offer')) return 3;
        if (status.includes('wawancara') || status.includes('interview')) return 2;
        if (status.includes('screening')) return 1;
        return 0; // Lamaran Diterima
    };

    const currentStageIndex = getStageIndex(activeApp);
    const viewedStageIndex = selectedStageIndex !== null ? selectedStageIndex : currentStageIndex;
    const isRejected = (activeApp?.status_lamaran || '').toLowerCase().includes('ditolak');

    const latestInterview = activeApp?.wawancara && activeApp.wawancara.length > 0
        ? activeApp.wawancara[activeApp.wawancara.length - 1]
        : null;
    const latestOffer = activeApp?.penawaran && activeApp.penawaran.length > 0
        ? activeApp.penawaran[activeApp.penawaran.length - 1]
        : null;

    const parseRescheduleInfo = (catatan) => {
        if (!catatan || !catatan.includes('[Pengajuan Jadwal Ulang Pelamar]')) return null;
        try {
            const matchTanggal = catatan.match(/Tanggal Baru:\s*([^|\n]+)/i);
            const matchWaktu = catatan.match(/Waktu:\s*([^|\n]+)/i);
            const matchAlasan = catatan.match(/Alasan:\s*([^\n]+)/i);
            return {
                tanggal: matchTanggal ? matchTanggal[1].trim() : '',
                waktu: matchWaktu ? matchWaktu[1].trim() : '',
                alasan: matchAlasan ? matchAlasan[1].trim() : '',
            };
        } catch {
            return null;
        }
    };

    const rescheduleInfo = parseRescheduleInfo(latestInterview?.catatan);
    const isPendingReschedule = latestInterview?.status_wawancara === 'Ditunda' || Boolean(rescheduleInfo && latestInterview?.status_wawancara !== 'Selesai');
    const isInterviewAccepted = latestInterview?.catatan?.includes('[Pelamar]: Telah mengonfirmasi kehadiran');

    // Helper to calculate stage display text and banners
    const getStageDetail = (app, targetStageIndex, curStageIndex) => {
        if (!app) {
            return {
                bannerTitle: 'STATUS LAMARAN',
                bannerBadge: 'BELUM ADA DATA',
                boxTitle: 'TIDAK ADA DATA',
                boxDesc: 'Belum ada data lamaran yang dipilih.',
            };
        }

        const status = (app.status_lamaran || '').toLowerCase();
        const isAppRejected = status.includes('ditolak');

        // If target stage is in the future
        if (targetStageIndex > curStageIndex && !isAppRejected) {
            return {
                bannerTitle: `TAHAP ${targetStageIndex + 1}: ${stepperSteps[targetStageIndex].toUpperCase()}`,
                bannerBadge: 'BELUM DIBUKA',
                boxTitle: 'TAHAPAN INI BELUM DILALUI',
                boxDesc: `Tahapan ini belum dapat diakses karena lamaran Anda saat ini masih berada pada tahap "${stepperSteps[curStageIndex]}". Informasi dan formulir untuk tahapan ini akan terbuka secara otomatis setelah Anda berhasil menyelesaikan tahapan sebelumnya.`,
                isFutureStage: true,
            };
        }

        // Stage 0: Lamaran Diterima
        if (targetStageIndex === 0) {
            return {
                bannerTitle: 'TAHAP 1: LAMARAN DITERIMA',
                bannerBadge: 'TERCATAT',
                boxTitle: 'BERKAS LAMARAN BERHASIL DITERIMA SISTEM',
                boxDesc: `Lamaran Anda untuk posisi ${app.lowongan?.judul_lowongan || app.lowongan?.posisi || 'Pekerjaan'} di Cybers Blitz Nusantara telah berhasil dikirim pada tanggal ${formatIndoDate(app.tanggal_lamaran)}. Seluruh berkas administrasi dan data profil Anda telah tersimpan secara aman dalam sistem rekrutmen kami.`,
            };
        }

        // Stage 1: Screening
        if (targetStageIndex === 1) {
            const isDone = curStageIndex > 1 || app.skor_kecocokan !== null;
            if (isAppRejected && curStageIndex === 1) {
                return {
                    bannerTitle: 'TAHAP 2: SCREENING CV & PORTOFOLIO',
                    bannerBadge: 'TIDAK LOLOS',
                    boxTitle: 'STATUS EVALUASI SCREENING: TIDAK LOLOS',
                    boxDesc: 'Setelah meninjau profil dan kualifikasi Anda secara komprehensif, saat ini kami belum dapat melanjutkan lamaran Anda ke tahapan berikutnya. Kami menghargai waktu serta dedikasi yang Anda berikan.',
                };
            }
            return {
                bannerTitle: 'TAHAP 2: SCREENING CV & PORTOFOLIO',
                bannerBadge: isDone ? 'LOLOS SCREENING' : 'SEDANG BERJALAN',
                boxTitle: isDone ? 'BERKAS TELAH DITINJAU & MEMENUHI SYARAT' : 'BERKAS ANDA SEDANG DITINJAU',
                boxDesc: isDone
                    ? 'Berkas lamaran, resume, serta pengalaman kerja Anda telah selesai ditinjau secara mendalam oleh tim rekrutmen. Kualifikasi Anda dinilai relevan dan memenuhi syarat standar untuk posisi ini.'
                    : 'Tim rekrutmen Cybers Blitz Nusantara sedang meninjau dan mengevaluasi portofolio serta dokumen pendukung Anda. Proses evaluasi ini memerlukan waktu sekitar 2-4 hari kerja.',
            };
        }

        // Stage 2: Wawancara
        if (targetStageIndex === 2) {
            const isInterviewDone = latestInterview?.status_wawancara === 'Selesai' || curStageIndex > 2;
            const isScheduled = latestInterview?.status_wawancara === 'Terjadwal';
            const isRescheduleMode = isRescheduling || isPendingReschedule;

            if (isAppRejected && curStageIndex === 2) {
                return {
                    bannerTitle: 'TAHAP WAWANCARA',
                    bannerBadge: 'TIDAK LOLOS',
                    boxTitle: 'STATUS EVALUASI WAWANCARA',
                    boxDesc: 'Terima kasih atas partisipasi Anda dalam sesi wawancara. Berdasarkan evaluasi akhir tim hiring, saat ini kami belum dapat melanjutkan proses rekrutmen Anda.',
                    interviewDone: true,
                };
            }

            if (isRescheduleMode) {
                return {
                    bannerTitle: 'JADWAL ULANG WAWANCARA',
                    bannerBadge: 'PENDING',
                    boxTitle: 'PENGAJUAN JADWAL ULANG WAWANCARA',
                    boxDesc: 'Silakan tentukan usulan tanggal dan jam baru jika Anda berhalangan hadir pada jadwal wawancara awal.',
                    isRescheduleState: true,
                };
            }

            if (isInterviewDone) {
                return {
                    bannerTitle: 'TAHAP WAWANCARA',
                    bannerBadge: 'SELESAI',
                    boxTitle: 'Note !',
                    boxDesc: latestInterview?.catatan || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                    interviewDone: true,
                };
            }

            return {
                bannerTitle: 'TAHAP WAWANCARA',
                bannerBadge: isScheduled ? 'TERJADWAL' : 'WAWANCARA',
                boxTitle: 'UNDANGAN WAWANCARA',
                boxDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                interviewDone: false,
            };
        }

        // Stage 3: Penawaran
        if (targetStageIndex === 3) {
            const offerStatus = latestOffer?.status_penawaran || (curStageIndex > 3 ? 'Diterima' : 'Menunggu');
            const isWaiting = latestOffer?.status_penawaran === 'Menunggu';

            return {
                bannerTitle: 'TAHAP 4: SURAT PENAWARAN KERJA',
                bannerBadge: isWaiting ? 'MENUNGGU AKSI' : offerStatus.toUpperCase(),
                boxTitle: 'SURAT PENAWARAN KERJA (OFFERING LETTER)',
                boxDesc: offerStatus === 'Diterima'
                    ? 'Selamat! Anda telah menerima surat penawaran kerja resmi ini. Berkas penawaran telah disetujui dan data Anda diproses ke tahap administrasi onboarding serta penerbitan Surat Keputusan (SK).'
                    : (offerStatus === 'Ditolak'
                        ? 'Anda telah menolak surat penawaran kerja ini.'
                        : 'Berdasarkan serangkaian evaluasi dan hasil wawancara yang memuaskan, kami dengan bangga menawarkan kesempatan berkarir di Cybers Blitz Nusantara. Silakan tinjau rincian penawaran berikut:'),
            };
        }

        // Stage 4: Dokumen Tambahan
        if (targetStageIndex === 4) {
            const hasDocs = app.dokumen && app.dokumen.length > 0;
            return {
                bannerTitle: 'TAHAP 5: DOKUMEN TAMBAHAN & ONBOARDING',
                bannerBadge: hasDocs ? 'TERSEDIA' : 'MENUNGGU UNGGAH',
                boxTitle: 'UNGGAH DOKUMEN TAMBAHAN / PENDUKUNG',
                boxDesc: 'Tim rekrutmen membutuhkan dokumen pendukung tambahan (seperti KTP, Ijazah, Transkrip Nilai, Portofolio, atau Sertifikat) untuk melengkapi berkas administrasi dan persiapan onboarding kerja Anda di Cybers Blitz Nusantara.',
            };
        }

        // Stage 5: Surat Keputusan
        if (targetStageIndex === 5) {
            if (isAppRejected) {
                return {
                    bannerTitle: 'TAHAP 6: SURAT KEPUTUSAN RESMI',
                    bannerBadge: 'TIDAK LOLOS',
                    boxTitle: 'STATUS AKHIR SELEKSI',
                    boxDesc: 'Terima kasih atas minat dan partisipasi Anda dalam proses rekrutmen di Cybers Blitz Nusantara. Setelah mempertimbangkan secara saksama, saat ini kami belum dapat melanjutkan proses lamaran Anda ke tahapan berikutnya. Kami menghargai waktu serta dedikasi yang Anda berikan.',
                };
            }

            return {
                bannerTitle: 'TAHAP 6: SURAT KEPUTUSAN RESMI',
                bannerBadge: 'DITERIMA',
                boxTitle: 'SELAMAT! ANDA RESMI DITERIMA',
                boxDesc: 'Selamat bergabung dengan Cybers Blitz Nusantara! Berkas penawaran kerja Anda telah diterima dan Anda dinyatakan resmi lolos seluruh tahapan seleksi. Tim HRD kami akan segera menghubungi Anda terkait kelengkapan administrasi dan jadwal onboarding.',
            };
        }

        // Default
        return {
            bannerTitle: 'LAMARAN DIKIRIM',
            bannerBadge: 'TERCATAT',
            boxTitle: 'STATUS LAMARAN',
            boxDesc: 'Berkas lamaran Anda telah berhasil dikirim dan tersimpan di sistem kami.',
        };
    };

    const stageInfo = getStageDetail(activeApp, viewedStageIndex, currentStageIndex);

    // Actions
    const handleAcceptOffer = (id_penawaran) => {
        if (confirm('Apakah Anda yakin ingin menerima penawaran pekerjaan ini?')) {
            router.post(`/pelamar/offers/${id_penawaran}/accept`);
        }
    };

    const handleRejectOffer = (id_penawaran) => {
        if (confirm('Apakah Anda yakin ingin menolak tawaran pekerjaan ini?')) {
            router.post(`/pelamar/offers/${id_penawaran}/reject`);
        }
    };

    const handleAcceptInterview = (id_wawancara) => {
        if (confirm('Konfirmasi kehadiran Anda pada jadwal wawancara ini?')) {
            router.post(`/pelamar/interviews/${id_wawancara}/accept`);
        }
    };

    const handleOpenReschedule = () => {
        setRescheduleForm({
            tanggal_baru: rescheduleInfo?.tanggal || '',
            waktu_baru: rescheduleInfo?.waktu || '',
            alasan: rescheduleInfo?.alasan || ''
        });
        setIsRescheduling(true);
    };

    const handleSubmitRescheduleForm = (e) => {
        e.preventDefault();
        if (!latestInterview) return;
        if (!rescheduleForm.tanggal_baru.trim() || !rescheduleForm.waktu_baru.trim()) {
            alert('Mohon isi tanggal baru dan waktu yang diinginkan.');
            return;
        }
        router.post(`/pelamar/interviews/${latestInterview.id_wawancara}/reschedule`, {
            tanggal_baru: rescheduleForm.tanggal_baru,
            waktu_baru: rescheduleForm.waktu_baru,
            alasan: rescheduleForm.alasan || ''
        }, {
            onSuccess: () => {
                setIsRescheduling(false);
            }
        });
    };

    const handleUploadDoc = (e) => {
        e.preventDefault();
        if (!uploadModal.file) {
            alert('Pilih file dokumen terlebih dahulu.');
            return;
        }
        const formData = new FormData();
        formData.append('jenis_dokumen', uploadModal.docType);
        formData.append('file_dokumen', uploadModal.file);

        router.post(`/pelamar/applications/${uploadModal.lamaranId}/documents`, formData, {
            onSuccess: () => setUploadModal({ open: false, lamaranId: null, docType: 'KTP', file: null })
        });
    };

    return (
        <PelamarLayout title="Dashboard Pelamar">
            <div className="pelamar-dashboard-container">

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="flash-success-row">
                        <span>{flash.success}</span>
                        <button onClick={() => router.reload()} className="flash-close-green">✕</button>
                    </div>
                )}
                {flash?.error && (
                    <div className="flash-error-row">
                        <span>{flash.error}</span>
                        <button onClick={() => router.reload()} className="flash-close-red">✕</button>
                    </div>
                )}

                {/* Main 2-Column Wireframe Grid */}
                <div className="pelamar-dashboard-grid">

                    {/* ══════════════════════════════════════════
                        KOLOM KIRI: "Lamaran" (List of applications)
                       ══════════════════════════════════════════ */}
                    <div className="pelamar-grid-left">
                        {/* Section Header */}
                        <SectionHeader title="Lamaran" meta={`${applications.length} Total`} />

                        {/* List of Application Cards */}
                        {applications.length === 0 ? (
                            <div className="pelamar-empty-card">
                                <p className="pelamar-empty-title">Belum ada lamaran diajukan</p>
                                <p className="pelamar-empty-desc">Mulai eksplorasi lowongan kerja yang tersedia sekarang.</p>
                                <a
                                    href="/jobs"
                                    className="btn-primary"
                                >
                                    + Cari Lowongan Sekarang
                                </a>
                            </div>
                        ) : (
                            <div className="pelamar-app-list">
                                {applications.map((app) => {
                                    const isSelected = app.id_lamaran === activeApp?.id_lamaran;
                                    const statusLower = (app.status_lamaran || '').toLowerCase();
                                    const hasOffer = app.penawaran && app.penawaran.length > 0;
                                    const isWaitingAction = statusLower.includes('penawaran') ||
                                        (app.wawancara && app.wawancara.some(w => w.status_wawancara === 'Terjadwal' || w.status_wawancara === 'Ditunda'));

                                    return (
                                        <div
                                            key={app.id_lamaran}
                                            onClick={() => {
                                                setSelectedId(app.id_lamaran);
                                                setSelectedStageIndex(null);
                                                setIsRescheduling(false);
                                            }}
                                            className={`card-interactive ${isSelected ? 'card-interactive-active' : ''}`}
                                        >
                                            {/* Row 1: Position Title & Top-Right Badge */}
                                            <div className="pelamar-card-top">
                                                <h3 className="pelamar-card-title">
                                                    {app.lowongan?.judul_lowongan || app.lowongan?.posisi || 'Frontend Engineer'}
                                                </h3>
                                                {isWaitingAction && (
                                                    <StatusBadge variant="pill">
                                                        MENUNGGU AKSI
                                                    </StatusBadge>
                                                )}
                                            </div>

                                            {/* Row 2: Subtitle (Tipe Lowongan — #Ref) */}
                                            <p className="pelamar-card-sub">
                                                Lamaran {app.lowongan?.tipe_pekerjaan || 'Full-Time'} — {formatRefNo(app.id_lamaran)}
                                            </p>

                                            {/* Row 3: Action Tag & Sent Date */}
                                            <div className="pelamar-card-foot">
                                                {/* Status / Stage Pill */}
                                                <div>
                                                    {statusLower.includes('ditolak') ? (
                                                        <StatusBadge variant="danger">DITOLAK</StatusBadge>
                                                    ) : statusLower.includes('diterima') || statusLower.includes('hired') ? (
                                                        <StatusBadge variant="success">DITERIMA</StatusBadge>
                                                    ) : statusLower.includes('dokumen') ? (
                                                        <StatusBadge variant="outline">DOKUMEN TAMBAHAN</StatusBadge>
                                                    ) : statusLower.includes('penawaran') || statusLower.includes('offer') || (hasOffer && !statusLower.includes('diterima')) ? (
                                                        <StatusBadge variant="solid">PENAWARAN</StatusBadge>
                                                    ) : statusLower.includes('wawancara') ? (
                                                        <StatusBadge variant="solid">WAWANCARA</StatusBadge>
                                                    ) : (
                                                        <StatusBadge variant="outline">SCREENING</StatusBadge>
                                                    )}
                                                </div>

                                                {/* Date */}
                                                <span className="pelamar-card-date">
                                                    Dikirim {formatIndoDate(app.tanggal_lamaran)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Button: + CARI LOWONGAN LAINNYA */}
                        <a
                            href="/jobs"
                            className="btn-explore-more"
                        >
                            + CARI LOWONGAN LAINNYA
                        </a>
                    </div>


                    {/* ══════════════════════════════════════════
                        KOLOM KANAN: "Detail Lamaran"
                       ══════════════════════════════════════════ */}
                    <div className="pelamar-grid-right">
                        {/* Section Header */}
                        <SectionHeader title="Detail Lamaran" />

                        {/* 1. TAHAPAN REKRUTMEN (Stepper / Interactive Stage Tracker) */}
                        <div className="pelamar-stepper-card">
                            <div className="pelamar-stepper-head">
                                <div className="pelamar-stepper-title">
                                    <span>TAHAPAN REKRUTMEN</span>
                                    <span className="pelamar-stepper-sep">|</span>
                                    <span className="pelamar-stepper-hint">Klik tahapan mana saja untuk melihat data</span>
                                </div>
                                <div className="pelamar-stepper-status">
                                    Tahap Aktif: <strong className="pelamar-strong">{stepperSteps[currentStageIndex]}</strong>
                                </div>
                            </div>

                            {/* Stepper Grid with equal spacing, clean alignment & horizontal connecting strips */}
                            <div className="pelamar-stepper-track">
                                <div className="pelamar-stepper-steps">
                                    {stepperSteps.map((stepName, idx) => {
                                        const isDone = idx <= currentStageIndex && !isRejected;
                                        const isCurrent = idx === currentStageIndex;
                                        const isViewed = idx === viewedStageIndex;

                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    setSelectedStageIndex(idx);
                                                    setIsRescheduling(false);
                                                }}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        setSelectedStageIndex(idx);
                                                        setIsRescheduling(false);
                                                    }
                                                }}
                                                title={`Klik untuk melihat data tahapan: ${stepName}`}
                                                className="pelamar-step-btn group"
                                            >
                                                {/* Connecting horizontal strip between steps */}
                                                {idx > 0 && (
                                                    <div
                                                        className={`absolute top-5 -left-1/2 w-full h-[2px] -translate-y-1/2 z-0 pointer-events-none transition-colors ${
                                                            idx <= currentStageIndex && !isRejected ? 'bg-black' : 'bg-gray-300'
                                                        }`}
                                                    />
                                                )}

                                                {/* Square Box (z-10 so it cleanly overlays the strip) */}
                                                <div
                                                    className={`relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-xs flex items-center justify-center transition-all duration-200 ${
                                                        isDone
                                                            ? 'bg-black text-white shadow-xs'
                                                            : 'border-2 border-black bg-white text-black'
                                                    } ${
                                                        isViewed
                                                            ? 'ring-2 ring-black ring-offset-2 ring-offset-white scale-110 shadow-md'
                                                            : 'group-hover:scale-105'
                                                    }`}
                                                >
                                                    {isDone ? (
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="stroke-white">
                                                            <polyline points="20 6 9 17 4 12"></polyline>
                                                        </svg>
                                                    ) : (
                                                        <div className={`w-3 h-3 sm:w-3.5 sm:h-3.5 border-2 border-black ${isViewed ? 'bg-black' : 'bg-white'}`}></div>
                                                    )}
                                                </div>

                                                {/* Step Label with Active & Current Indicators */}
                                                <div
                                                    className={`mt-2.5 text-[10px] sm:text-[11px] font-bold leading-tight px-1 min-h-[2.5rem] flex flex-col items-center justify-start transition-colors ${
                                                        isViewed
                                                            ? 'text-black underline underline-offset-4 decoration-2'
                                                            : 'text-gray-700 group-hover:text-black'
                                                    }`}
                                                >
                                                    <span>{stepName}</span>
                                                    {isViewed ? (
                                                        <span className="mt-1 text-[8px] sm:text-[9px] uppercase tracking-wider font-extrabold bg-black text-white px-1.5 py-0.5 rounded shadow-xs">
                                                            Dilihat
                                                        </span>
                                                    ) : isCurrent ? (
                                                        <span className="mt-1 text-[8px] sm:text-[9px] uppercase tracking-wider font-bold border border-black text-black px-1 py-0.2 rounded">
                                                            Tahap Kini
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Mode Riwayat Alert Banner (when viewing non-current stage) */}
                        {viewedStageIndex !== currentStageIndex && (
                            <div className="pelamar-history-alert">
                                <div className="pelamar-history-text">
                                    <span className="font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-[10px]">
                                        Mode Riwayat
                                    </span>
                                    <span>
                                        Anda sedang melihat data tahapan: <strong className="font-bold text-black">{stepperSteps[viewedStageIndex]}</strong>
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedStageIndex(currentStageIndex)}
                                    className="pelamar-history-btn"
                                >
                                    Kembali ke Tahap Saat Ini ({stepperSteps[currentStageIndex]}) →
                                </button>
                            </div>
                        )}

                        {/* 2. Banner Bar + Details Container */}
                        <div className="pelamar-card-stage-wrap">
                            {/* Black Banner Bar */}
                            <div className="card-header-dark">
                                <span className="card-header-title">
                                    {stageInfo.bannerTitle}
                                </span>
                                <span className="card-header-badge">
                                    {stageInfo.bannerBadge}
                                </span>
                            </div>

                            {/* White Body Details */}
                            <div className="pelamar-stage-body">

                                {/* Sub-box A: Explanatory / Description Card (For stages other than stage 2) */}
                                {viewedStageIndex !== 2 && (
                                    <div className="pelamar-stage-desc-card">
                                        <div className="pelamar-stage-desc-head">
                                            <h4 className="pelamar-stage-desc-title">
                                                {stageInfo.boxTitle}
                                            </h4>
                                            {viewedStageIndex === currentStageIndex ? (
                                                <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded uppercase tracking-wider">
                                                    Tahap Terkini
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded uppercase tracking-wider">
                                                    Riwayat Tahap
                                                </span>
                                            )}
                                        </div>
                                        <p className="pelamar-stage-desc-text">
                                            {stageInfo.boxDesc}
                                        </p>
                                    </div>
                                )}

                                {/* Sub-box B: Specific Stage Info */}

                                {/* ── TAHAP 0: LAMARAN DITERIMA ── */}
                                {viewedStageIndex === 0 && (
                                    <div className="space-y-3">
                                        <div className="pelamar-stage-grid-2">
                                            <InfoCard
                                                label="TANGGAL PENGAJUAN"
                                                value={formatIndoDate(activeApp?.tanggal_lamaran)}
                                            />
                                            <InfoCard
                                                label="NOMOR REFERENSI"
                                                value={formatRefNo(activeApp?.id_lamaran)}
                                            />
                                            <InfoCard
                                                label="POSISI YANG DILAMAR"
                                                value={activeApp?.lowongan?.judul_lowongan || activeApp?.lowongan?.posisi}
                                            />
                                            <InfoCard
                                                label="STATUS PENDAFTARAN"
                                                value="BERKAS TERCATAT LENGKAP"
                                                valueClassName="text-green-700"
                                            />
                                        </div>

                                        {/* Dokumen Lamaran Awal */}
                                        <div className="card-base-sm bg-gray-50/60 space-y-2">
                                            <div className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                                                Dokumen Lamaran Awal
                                            </div>
                                            {activeApp?.dokumen && activeApp.dokumen.length > 0 ? (
                                                <div className="space-y-1.5">
                                                    {activeApp.dokumen.map(doc => (
                                                        <div key={doc.id_dokumen} className="flex justify-between items-center text-xs p-2.5 bg-white border border-gray-300 rounded">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded text-[10px]">FILE</span>
                                                                <span className="font-semibold text-gray-800">{doc.jenis_dokumen}: {doc.file_dokumen}</span>
                                                            </div>
                                                            <span className="text-gray-500 text-[10px]">Diunggah {formatIndoDate(doc.tanggal_upload)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-3 bg-white border border-gray-200 rounded text-xs text-gray-600">
                                                    CV dan biodata pelamar tersimpan secara terpusat pada akun profil Anda.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ── TAHAP 1: SCREENING ── */}
                                {viewedStageIndex === 1 && (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <InfoCard
                                                label="SKOR KECOCOKAN KUALIFIKASI"
                                                value={activeApp?.skor_kecocokan ? `${activeApp.skor_kecocokan}% (Tingkat Kecocokan Tinggi)` : '85.00% (Memenuhi Syarat)'}
                                                valueClassName="text-black font-extrabold"
                                            />
                                            <InfoCard
                                                label="STATUS SCREENING"
                                                value={currentStageIndex > 1 || activeApp?.skor_kecocokan ? 'LOLOS SELEKSI AWAL' : 'DALAM PENINJAUAN'}
                                                valueClassName={currentStageIndex > 1 || activeApp?.skor_kecocokan ? 'text-green-700 font-bold' : 'text-gray-800'}
                                            />
                                            <InfoCard
                                                label="TIM EVALUATOR"
                                                value="Talent Acquisition & HRD"
                                            />
                                            <InfoCard
                                                label="PENDIDIKAN TERAKHIR"
                                                value={activeApp?.pelamar?.pendidikan_terakhir || 'Sesuai Portofolio'}
                                            />
                                        </div>

                                        <div className="card-base-sm bg-gray-50/60 p-3 space-y-1.5 text-xs text-gray-700">
                                            <div className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">Catatan Evaluasi Screening</div>
                                            <p className="leading-relaxed">
                                                Penilaian awal CV dan kualifikasi telah dianalisis berdasarkan kecocokan kompetensi, riwayat pendidikan, dan portofolio keahlian terhadap persyaratan lowongan {activeApp?.lowongan?.judul_lowongan || activeApp?.lowongan?.posisi || 'pekerjaan'}.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* ── TAHAP 2: WAWANCARA (INTERVIEW) ── */}
                                {viewedStageIndex === 2 && (
                                    <div className="space-y-4">
                                        {/* OPTION A: RESCHEDULE FORM / PENDING VIEW (Image 1) */}
                                        {(isRescheduling || isPendingReschedule) ? (
                                            <div className="space-y-4">
                                                {/* If already submitted and waiting for HRD, and user is not editing */}
                                                {isPendingReschedule && !isRescheduling ? (
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            <div className="border border-gray-800 rounded-lg p-3 sm:p-4 bg-white">
                                                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                                                                    TANGGAL BARU
                                                                </span>
                                                                <span className="text-sm font-bold text-black block">
                                                                    {rescheduleInfo?.tanggal || rescheduleForm.tanggal_baru || '12 Agustus 2026'}
                                                                </span>
                                                            </div>
                                                            <div className="border border-gray-800 rounded-lg p-3 sm:p-4 bg-white">
                                                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                                                                    WAKTU
                                                                </span>
                                                                <span className="text-sm font-bold text-black block">
                                                                    {rescheduleInfo?.waktu || rescheduleForm.waktu_baru || '10.00 - 11.00 WIB'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {rescheduleInfo?.alasan && (
                                                            <div className="border border-gray-800 rounded-lg p-3 bg-gray-50">
                                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                                                                    ALASAN
                                                                </span>
                                                                <p className="text-xs text-gray-800 font-medium">
                                                                    {rescheduleInfo.alasan}
                                                                </p>
                                                            </div>
                                                        )}

                                                        <div className="space-y-2 pt-1">
                                                            <button
                                                                type="button"
                                                                onClick={handleOpenReschedule}
                                                                className="btn-primary w-full text-xs !py-3 tracking-widest font-bold"
                                                            >
                                                                AJUKAN JADWAL ULANG
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* Active Reschedule Form (Image 1) */
                                                    <form onSubmit={handleSubmitRescheduleForm} className="space-y-4">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            <div className="border border-gray-800 rounded-lg p-3 sm:p-4 bg-white">
                                                                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                                                                    TANGGAL BARU
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="HH/BB/TTTT"
                                                                    value={rescheduleForm.tanggal_baru}
                                                                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, tanggal_baru: e.target.value })}
                                                                    className="w-full text-sm font-bold text-black border-none p-0 focus:ring-0 focus:outline-none placeholder-gray-400 bg-transparent"
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="border border-gray-800 rounded-lg p-3 sm:p-4 bg-white">
                                                                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                                                                    WAKTU
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="JJ.MM - JJ.MM"
                                                                    value={rescheduleForm.waktu_baru}
                                                                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, waktu_baru: e.target.value })}
                                                                    className="w-full text-sm font-bold text-black border-none p-0 focus:ring-0 focus:outline-none placeholder-gray-400 bg-transparent"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Optional Alasan */}
                                                        <div className="border border-gray-800 rounded-lg p-3 bg-white">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                                                                ALASAN PERUBAHAN JADWAL (OPSIONAL)
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="Cantumkan alasan atau preferensi waktu jika ada..."
                                                                value={rescheduleForm.alasan}
                                                                onChange={(e) => setRescheduleForm({ ...rescheduleForm, alasan: e.target.value })}
                                                                className="w-full text-xs font-semibold text-black border-none p-0 focus:ring-0 focus:outline-none placeholder-gray-400 bg-transparent"
                                                            />
                                                        </div>

                                                        <div>
                                                            <button
                                                                type="submit"
                                                                className="btn-primary w-full text-xs !py-3 tracking-widest font-bold"
                                                            >
                                                                AJUKAN JADWAL ULANG
                                                            </button>
                                                            {!isPendingReschedule && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setIsRescheduling(false)}
                                                                    className="text-xs text-gray-500 hover:text-black font-semibold text-center w-full mt-2.5 block underline cursor-pointer"
                                                                >
                                                                    ← Batal & Kembali ke Undangan Wawancara
                                                                </button>
                                                            )}
                                                        </div>
                                                    </form>
                                                )}
                                            </div>
                                        ) : latestInterview ? (
                                            /* OPTION B: SCHEDULED (Image 3) OR COMPLETED (Image 2) */
                                            <>
                                                {/* Sub-box: UNDANGAN WAWANCARA or Note ! */}
                                                <div className="card-base-sm">
                                                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                                                        {latestInterview.status_wawancara === 'Selesai' ? 'Note !' : 'UNDANGAN WAWANCARA'}
                                                    </h4>
                                                    <p className="text-xs text-gray-600 leading-relaxed">
                                                        {stageInfo.boxDesc}
                                                    </p>
                                                </div>

                                                {/* 2-column info cards */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <InfoCard
                                                        label="TANGGAL WAWANCARA"
                                                        value={formatIndoDate(latestInterview.tanggal_wawancara)}
                                                    />
                                                    <InfoCard
                                                        label="WAKTU"
                                                        value={formatInterviewTime(latestInterview.tanggal_wawancara)}
                                                    />
                                                    <InfoCard
                                                        label="FORMAT"
                                                        value={latestInterview.format_wawancara === 'Online'
                                                            ? 'ONLINE ( ZOOM )'
                                                            : `OFFLINE (${latestInterview.lokasi || 'KANTOR PUSAT'})`}
                                                        valueClassName="uppercase font-bold text-black"
                                                    />
                                                    <InfoCard
                                                        label="PEWAWANCARA"
                                                        value={latestInterview.interviewer || 'HR Manager'}
                                                        valueClassName="font-bold text-black"
                                                    />
                                                </div>

                                                {/* Link Meeting / Lokasi */}
                                                <InfoCard label="LINK MEETING">
                                                    {latestInterview.format_wawancara === 'Online' ? (
                                                        latestInterview.link_meeting ? (
                                                            <a
                                                                href={latestInterview.link_meeting}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs font-bold text-blue-600 hover:underline tracking-wide"
                                                            >
                                                                [ {latestInterview.link_meeting} ]
                                                            </a>
                                                        ) : (
                                                            <span className="text-xs font-bold text-black">[ LINK MEETING ]</span>
                                                        )
                                                    ) : (
                                                        <span className="text-xs font-bold text-black">{latestInterview.lokasi || 'Kantor Pusat'}</span>
                                                    )}
                                                </InfoCard>

                                                {/* 4 Metadata Cards inside Stage 2 (Image 2 & 3) */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <InfoCard
                                                        label="TANGGAL DIKIRIM"
                                                        value={formatIndoDate(activeApp?.tanggal_lamaran)}
                                                    />
                                                    <InfoCard
                                                        label="NOMOR REFERENSI"
                                                        value={formatRefNo(activeApp?.id_lamaran)}
                                                    />
                                                    <InfoCard
                                                        label="DEPARTMENT"
                                                        value={activeApp?.lowongan?.departemen || 'IT Department'}
                                                    />
                                                    <InfoCard
                                                        label="TIPE LOWONGAN"
                                                        value={activeApp?.lowongan?.tipe_pekerjaan || 'Full-Time'}
                                                    />
                                                </div>

                                                {/* Bottom action buttons for Terjadwal: [ JADWAL ULANG ] and [ TERIMA ] (Image 3) */}
                                                {latestInterview.status_wawancara === 'Terjadwal' && (
                                                    <div className="grid grid-cols-2 gap-3 pt-1">
                                                        <button
                                                            type="button"
                                                            onClick={handleOpenReschedule}
                                                            className="btn-primary w-full text-xs !py-3 tracking-widest font-bold"
                                                        >
                                                            JADWAL ULANG
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAcceptInterview(latestInterview.id_wawancara)}
                                                            className="btn-primary w-full text-xs !py-3 tracking-widest font-bold"
                                                        >
                                                            {isInterviewAccepted ? 'TERKONFIRMASI ✓' : 'TERIMA'}
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            /* Interview Not Yet Scheduled */
                                            <div className="space-y-3">
                                                <div className="card-base-sm">
                                                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                                                        INFORMASI TAHAP WAWANCARA
                                                    </h4>
                                                    <p className="text-xs text-gray-600 leading-relaxed">
                                                        {stageInfo.boxDesc}
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <InfoCard
                                                        label="STATUS TAHAPAN"
                                                        value={currentStageIndex > 2 ? "SELESAI (LOLOS)" : "DALAM PENJADWALAN"}
                                                        valueClassName={currentStageIndex > 2 ? "text-green-700 font-bold" : "text-black"}
                                                    />
                                                    <InfoCard
                                                        label="PEWAWANCARA"
                                                        value="Hiring Manager & HR Lead"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <InfoCard
                                                        label="TANGGAL DIKIRIM"
                                                        value={formatIndoDate(activeApp?.tanggal_lamaran)}
                                                    />
                                                    <InfoCard
                                                        label="NOMOR REFERENSI"
                                                        value={formatRefNo(activeApp?.id_lamaran)}
                                                    />
                                                    <InfoCard
                                                        label="DEPARTMENT"
                                                        value={activeApp?.lowongan?.departemen || 'IT Department'}
                                                    />
                                                    <InfoCard
                                                        label="TIPE LOWONGAN"
                                                        value={activeApp?.lowongan?.tipe_pekerjaan || 'Full-Time'}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── TAHAP 3: PENAWARAN (OFFERING) ── */}
                                {viewedStageIndex === 3 && (
                                    <div className="space-y-3">
                                        {latestOffer ? (
                                            <>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <InfoCard
                                                        label="POSISI KERJA"
                                                        value={latestOffer.posisi_kerja || activeApp?.lowongan?.judul_lowongan || activeApp?.lowongan?.posisi}
                                                    />
                                                    <InfoCard
                                                        label="NOMINAL GAJI DITAWARKAN"
                                                        value={`Rp ${Number(latestOffer.nominal_gaji).toLocaleString('id-ID')} / Bulan`}
                                                    />
                                                    <InfoCard
                                                        label="LOKASI KERJA"
                                                        value={latestOffer.lokasi_kerja || activeApp?.lowongan?.lokasi}
                                                    />
                                                    <InfoCard
                                                        label="STATUS PENAWARAN"
                                                        value={latestOffer.status_penawaran}
                                                        valueClassName="uppercase font-bold"
                                                    />
                                                </div>

                                                {latestOffer.tanggal_penawaran && (
                                                    <InfoCard
                                                        label="TANGGAL PENERBITAN PENAWARAN"
                                                        value={formatIndoDate(latestOffer.tanggal_penawaran)}
                                                    />
                                                )}

                                                {latestOffer.status_penawaran === 'Menunggu' ? (
                                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRejectOffer(latestOffer.id_penawaran)}
                                                            className="btn-secondary w-full"
                                                        >
                                                            TOLAK PENAWARAN
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAcceptOffer(latestOffer.id_penawaran)}
                                                            className="btn-primary w-full"
                                                        >
                                                            TERIMA PENAWARAN
                                                        </button>
                                                    </div>
                                                ) : latestOffer.status_penawaran === 'Diterima' ? (
                                                    <div className="p-3 bg-green-50 border border-green-200 rounded text-xs text-green-800 font-semibold flex items-center gap-2">
                                                        <span>✓</span>
                                                        <span>Anda telah resmi menerima tawaran kerja ini. Berkas penawaran telah disetujui untuk proses administrasi onboarding.</span>
                                                    </div>
                                                ) : (
                                                    <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 font-semibold flex items-center gap-2">
                                                        <span>✕</span>
                                                        <span>Penawaran kerja ini telah ditolak.</span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <InfoCard
                                                        label="POSISI KERJA"
                                                        value={activeApp?.lowongan?.judul_lowongan || activeApp?.lowongan?.posisi}
                                                    />
                                                    <InfoCard
                                                        label="STATUS PENAWARAN"
                                                        value={currentStageIndex > 3 ? "DITERIMA & DISETUJUI" : "DALAM PENYIAPAN"}
                                                        valueClassName={currentStageIndex > 3 ? "text-green-700 font-bold" : "text-gray-800"}
                                                    />
                                                    <InfoCard
                                                        label="DEPARTEMEN"
                                                        value={activeApp?.lowongan?.departemen}
                                                    />
                                                    <InfoCard
                                                        label="LOKASI KERJA"
                                                        value={activeApp?.lowongan?.lokasi}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── TAHAP 4: DOKUMEN TAMBAHAN ── */}
                                {viewedStageIndex === 4 && (
                                    <div className="card-base-sm space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-black uppercase tracking-wider">
                                                Dokumen Pendukung Yang Diunggah
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setUploadModal({ open: true, lamaranId: activeApp?.id_lamaran, docType: 'KTP', file: null })}
                                                className="btn-primary-sm"
                                            >
                                                + Unggah Dokumen
                                            </button>
                                        </div>
                                        {activeApp?.dokumen && activeApp.dokumen.length > 0 ? (
                                            <div className="space-y-1.5">
                                                {activeApp.dokumen.map(doc => (
                                                    <div key={doc.id_dokumen} className="flex justify-between items-center text-xs p-2.5 bg-gray-50 border border-gray-200 rounded">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded text-[10px]">FILE</span>
                                                            <span className="font-semibold text-gray-800">{doc.jenis_dokumen}: {doc.file_dokumen}</span>
                                                        </div>
                                                        <span className="text-gray-500 text-[10px]">{formatIndoDate(doc.tanggal_upload)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-500 italic">Belum ada dokumen tambahan yang diunggah.</p>
                                        )}
                                    </div>
                                )}

                                {/* ── TAHAP 5: SURAT KEPUTUSAN (SK) ── */}
                                {viewedStageIndex === 5 && (
                                    <>
                                        {!isRejected ? (
                                            <div className="pelamar-sk-card">
                                                <div className="pelamar-sk-header">
                                                    <div className="flex items-center gap-3">
                                                        <div className="pelamar-sk-icon-box">
                                                            PDF
                                                        </div>
                                                        <div>
                                                            <h5 className="pelamar-sk-title">
                                                                {(() => {
                                                                    const uploadedSK = activeApp?.dokumen?.find(d => /keputusan|sk/i.test(d.jenis_dokumen));
                                                                    if (uploadedSK?.file_dokumen) return uploadedSK.file_dokumen;
                                                                    
                                                                    const candidateName = activeApp?.pelamar?.nama_lengkap || activeApp?.nama_lengkap || 'Kandidat';
                                                                    const cleanCandidateName = candidateName
                                                                        .trim()
                                                                        .replace(/[^a-zA-Z0-9]+/g, '_')
                                                                        .replace(/^_+|_+$/g, '');
                                                                    return `Surat_Keputusan_Penerimaan_${cleanCandidateName}.pdf`;
                                                                })()}
                                                            </h5>
                                                            <p className="pelamar-sk-subtitle">
                                                                Dokumen Resmi Keputusan Penerimaan Kerja • Terverifikasi HRD
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <StatusBadge variant="success">
                                                        RESMI DITERBITKAN
                                                    </StatusBadge>
                                                </div>

                                                <p className="pelamar-sk-desc">
                                                    Sistem telah menerima dan memproses Surat Keputusan (SK) dari tim HRD. Anda dapat mengunduh berkas ini sebagai bukti kelulusan seleksi dan arsip resmi untuk keperluan administrasi onboard.
                                                </p>

                                                <div className="pelamar-sk-actions">
                                                    <a
                                                        href={`/pelamar/applications/${activeApp?.id_lamaran}/surat-keputusan`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn-sk-download"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                            <polyline points="7 10 12 15 17 10"></polyline>
                                                            <line x1="12" y1="15" x2="12" y2="3"></line>
                                                        </svg>
                                                        UNDUH SURAT KEPUTUSAN (PDF)
                                                    </a>
                                                    <a
                                                        href={`/pelamar/applications/${activeApp?.id_lamaran}/surat-keputusan`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn-sk-print"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                                            <rect x="6" y="14" width="12" height="8"></rect>
                                                        </svg>
                                                        LIHAT / CETAK SURAT
                                                    </a>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-2">
                                                <div className="font-bold uppercase tracking-wider text-sm">Hasil Akhir: Tidak Lolos Seleksi</div>
                                                <p className="leading-relaxed">
                                                    Kami mengucapkan terima kasih atas dedikasi dan waktu yang Anda luangkan dalam mengikuti tahapan seleksi di Cybers Blitz Nusantara. Data profil Anda tetap tersimpan dalam talent pool kami untuk kesempatan karir di masa mendatang.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* ── TAHAPAN BELUM DIBUKA (FUTURE STAGE) ── */}
                                {viewedStageIndex > currentStageIndex && !isRejected && (
                                    <div className="card-base-sm bg-gray-50 border-dashed border-gray-400 p-6 text-center space-y-3">
                                        <div className="w-10 h-10 mx-auto rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                                                Tahap {stepperSteps[viewedStageIndex]} Belum Dibuka
                                            </h5>
                                            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                                                Lamaran Anda saat ini masih berada di tahap <strong>{stepperSteps[currentStageIndex]}</strong>. Anda dapat melihat dan mengakses rincian tahap ini setelah tahapan sebelumnya selesai dan dinyatakan lolos.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedStageIndex(currentStageIndex)}
                                            className="btn-primary-sm"
                                        >
                                            Kembali ke Tahap Saat Ini ({stepperSteps[currentStageIndex]})
                                        </button>
                                    </div>
                                )}

                                {/* ── SUB-BOX C: THE 4-GRID COMMON METADATA (FOR STAGES OTHER THAN STAGE 2) ── */}
                                {viewedStageIndex !== 2 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                        <InfoCard
                                            label="TANGGAL DIKIRIM"
                                            value={formatIndoDate(activeApp?.tanggal_lamaran)}
                                        />
                                        <InfoCard
                                            label="NOMOR REFERENSI"
                                            value={formatRefNo(activeApp?.id_lamaran)}
                                        />
                                        <InfoCard
                                            label="DEPARTMENT"
                                            value={activeApp?.lowongan?.departemen || 'IT Department'}
                                        />
                                        <InfoCard
                                            label="TIPE LOWONGAN"
                                            value={activeApp?.lowongan?.tipe_pekerjaan || 'Full-Time'}
                                        />
                                    </div>
                                )}

                            </div>
                        </div>

                    </div>

                </div>

            </div>



            {/* ══ MODAL UPLOAD DOKUMEN TAMBAHAN ══ */}
            <PelamarModal
                isOpen={uploadModal.open}
                onClose={() => setUploadModal({ open: false, lamaranId: null, docType: 'KTP', file: null })}
                title="Unggah Dokumen Tambahan"
            >
                <form onSubmit={handleUploadDoc} className="space-y-4">
                    <div>
                        <label className="form-label-base">
                            Jenis Dokumen
                        </label>
                        <select
                            value={uploadModal.docType}
                            onChange={(e) => setUploadModal({ ...uploadModal, docType: e.target.value })}
                            className="form-select-base"
                        >
                            <option value="KTP">KTP / Identitas</option>
                            <option value="Ijazah">Ijazah / Transkrip</option>
                            <option value="Portofolio">Portofolio / Sertifikat</option>
                            <option value="SKCK">SKCK / Surat Keterangan</option>
                            <option value="Lainnya">Dokumen Lainnya</option>
                        </select>
                    </div>

                    <div>
                        <label className="form-label-base">
                            Pilih File (PDF / Gambar, Maks 5MB)
                        </label>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => setUploadModal({ ...uploadModal, file: e.target.files[0] })}
                            className="form-input-base"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => setUploadModal({ open: false, lamaranId: null, docType: 'KTP', file: null })}
                            className="btn-secondary-sm"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="btn-primary-sm"
                        >
                            Unggah File
                        </button>
                    </div>
                </form>
            </PelamarModal>
        </PelamarLayout>
    );
}
