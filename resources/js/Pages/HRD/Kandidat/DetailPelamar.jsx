import React, { useState } from 'react';
import { router, Link, useForm } from '@inertiajs/react';
import KandidatDetailLayout from '@/Components/HRD/KandidatDetailLayout';
import InfoCard from '@/Components/InfoCard';

export default function DetailPelamar({ lamaran }) {
    const pelamar = lamaran.pelamar;
    const sosmed = pelamar?.sosial_media || pelamar?.sosialMedia || [];
    
    // CV / Resume
    const resume = lamaran.dokumen?.find(d => {
        const j = (d.jenis_dokumen || '').toLowerCase();
        return j.includes('cv') || j.includes('resume');
    }) || lamaran.dokumen?.[0];

    // Dokumen Tambahan (Portofolio, Sertifikat, Ijazah, KTP, dll)
    const dokumenTambahan = (lamaran.dokumen || []).filter(d => {
        const j = (d.jenis_dokumen || '').toLowerCase();
        const isCv = j.includes('cv') || j.includes('resume');
        const isSk = j.includes('keputusan') || j.includes('sk');
        return !isCv && !isSk && d.id_dokumen !== resume?.id_dokumen;
    });

    // Surat Keputusan (SK) jika sudah diunggah HRD
    const suratKeputusan = (lamaran.dokumen || []).find(d => {
        const j = (d.jenis_dokumen || '').toLowerCase();
        return j.includes('keputusan') || j.includes('sk');
    });

    const [isReverting, setIsReverting] = useState(false);
    const [targetRevertStatus, setTargetRevertStatus] = useState('Screening');
    const [showSkUploadForm, setShowSkUploadForm] = useState(!suratKeputusan);

    // Form Upload Surat Keputusan (HRD 22)
    const { data: skData, setData: setSkData, post: postSk, processing: skProcessing, errors: skErrors, reset: resetSk } = useForm({
        file_sk: null,
    });

    const handleAction = (action) => {
        if (confirm(`Yakin ingin ${action.toUpperCase()} kandidat ini?`)) {
            router.post(route(`hrd.kandidat.${action}`, lamaran.id_lamaran));
        }
    };

    const handleRevertStatus = (e) => {
        e.preventDefault();
        router.post(route('hrd.kandidat.revert_status', lamaran.id_lamaran), {
            target_status: targetRevertStatus
        }, {
            onSuccess: () => setIsReverting(false)
        });
    };

    const handleUploadSk = (e) => {
        e.preventDefault();
        if (!skData.file_sk) {
            alert('Pilih file Surat Keputusan (PDF) terlebih dahulu!');
            return;
        }
        postSk(route('hrd.kandidat.upload_sk', lamaran.id_lamaran), {
            preserveScroll: true,
            onSuccess: () => {
                alert('Surat Keputusan berhasil diunggah!');
                resetSk();
                setShowSkUploadForm(false);
            }
        });
    };

    const isFinalStatus = ['Diterima', 'Ditolak'].includes(lamaran.status_lamaran);
    // Jika lamaran berada pada tahap Status Kandidat (Pending / Final / Penawaran selesai)
    const isStatusKandidatStage = ['Pending', 'Diterima', 'Ditolak'].includes(lamaran.status_lamaran);

    return (
        <KandidatDetailLayout title="Detail Pelamar" lamaran={lamaran}>
            <div className="kandidat-flow">

                {/* Status Banner */}
                {isFinalStatus && (
                    <div className={`p-4 rounded border flex items-center justify-between mb-2 ${lamaran.status_lamaran === 'Diterima' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
                        <div>
                            <span className="font-bold text-xs uppercase tracking-wider block">
                                Status Kandidat Saat Ini: {lamaran.status_lamaran.toUpperCase()}
                            </span>
                            <span className="text-xs">
                                Anda dapat mengembalikan status kandidat ini jika ada perubahan keputusan.
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsReverting(true)}
                            className="px-3 py-1.5 bg-white border border-gray-400 text-gray-800 hover:bg-gray-100 rounded text-xs font-bold uppercase transition cursor-pointer"
                        >
                            ↩ Ubah / Kembalikan Status
                        </button>
                    </div>
                )}

                {/* Modal Revert Status */}
                {isReverting && (
                    <div className="p-4 bg-amber-50 border border-amber-300 rounded mb-4 shadow-sm">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900 mb-2">
                            Kembalikan Status Pelamar
                        </h4>
                        <p className="text-xs text-amber-800 mb-3">
                            Pilih tahap proses rekrutmen untuk mengembalikan kandidat ini:
                        </p>
                        <form onSubmit={handleRevertStatus} className="flex items-center gap-3">
                            <select
                                value={targetRevertStatus}
                                onChange={(e) => setTargetRevertStatus(e.target.value)}
                                className="text-xs font-bold border border-gray-300 rounded px-3 py-1.5 bg-white cursor-pointer"
                            >
                                <option value="Screening">Tahap Screening</option>
                                <option value="Wawancara">Tahap Wawancara</option>
                                <option value="Penawaran">Tahap Penawaran</option>
                            </select>
                            <button
                                type="submit"
                                className="px-4 py-1.5 bg-black text-white rounded text-xs font-bold uppercase hover:bg-gray-800 transition cursor-pointer"
                            >
                                Konfirmasi Kembalikan
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsReverting(false)}
                                className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-100 transition cursor-pointer"
                            >
                                Batal
                            </button>
                        </form>
                    </div>
                )}

                {/* Informasi Lowongan & Skor ATS (HRD 6 & HRD 18) */}
                <div className="kandidat-info-stack">
                    <InfoCard label="Posisi yang Dilamar" value={lamaran.lowongan?.judul_lowongan || lamaran.lowongan?.posisi || '—'} />
                    <InfoCard label="Departemen" value={lamaran.lowongan?.departemen || '—'} />
                    <InfoCard label="Pendidikan Terakhir" value={pelamar?.pendidikan_terakhir || '—'} />
                    <InfoCard label="Skor Kecocokan ATS" value={lamaran.skor_kecocokan !== null && lamaran.skor_kecocokan !== undefined ? `${lamaran.skor_kecocokan}%` : '0%'} />
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

                    {/* CV / Resume (HRD 6 & HRD 17) */}
                    <div>
                        <span className="form-label-base block mb-2">CV / Resume</span>
                        {resume ? (
                            <div className="kandidat-doc-row">
                                <div className="kandidat-doc-meta">
                                    <span className="hrd-doc-icon">PDF</span>
                                    <span className="kandidat-doc-filename">
                                        {resume.file_dokumen || 'Curriculum_Vitae.pdf'}
                                    </span>
                                </div>
                                <div className="kandidat-doc-actions">
                                    <a
                                        href={route('hrd.kandidat.dokumen.view', resume.id_dokumen)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn-secondary-sm cursor-pointer"
                                    >
                                        LIHAT CV
                                    </a>
                                    <a
                                        href={route('hrd.kandidat.dokumen.download', resume.id_dokumen)}
                                        download
                                        className="btn-primary-sm flex items-center gap-1 cursor-pointer"
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

                {/* ── Dokumen Tambahan Pelamar (HRD 21) ── */}
                <div className="kandidat-box">
                    <div className="flex items-center justify-between mb-3">
                        <div className="kandidat-box-label mb-0">Berkas &amp; Dokumen Tambahan</div>
                        <span className="text-[11px] font-bold text-gray-500">
                            {dokumenTambahan.length} Berkas Tersedia
                        </span>
                    </div>

                    {dokumenTambahan.length > 0 ? (
                        <div className="space-y-2.5">
                            {dokumenTambahan.map((doc) => (
                                <div key={doc.id_dokumen} className="kandidat-doc-row bg-gray-50 p-3 rounded border border-gray-200">
                                    <div className="kandidat-doc-meta">
                                        <span className="hrd-doc-icon bg-orange-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded">
                                            {doc.jenis_dokumen ? doc.jenis_dokumen.substring(0, 3).toUpperCase() : 'DOC'}
                                        </span>
                                        <div>
                                            <div className="kandidat-doc-filename font-bold text-xs text-gray-900">
                                                {doc.file_dokumen || doc.jenis_dokumen}
                                            </div>
                                            <div className="text-[10px] text-gray-500">
                                                Jenis: <strong>{doc.jenis_dokumen}</strong>
                                                {doc.tanggal_upload && ` • Diunggah: ${new Date(doc.tanggal_upload).toLocaleDateString('id-ID')}`}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="kandidat-doc-actions flex items-center gap-2">
                                        <a
                                            href={route('hrd.kandidat.dokumen.view', doc.id_dokumen)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn-secondary-sm text-xs cursor-pointer"
                                        >
                                            LIHAT DOKUMEN
                                        </a>
                                        <a
                                            href={route('hrd.kandidat.dokumen.download', doc.id_dokumen)}
                                            download
                                            className="btn-primary-sm text-xs flex items-center gap-1 cursor-pointer"
                                        >
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                                            </svg>
                                            UNDUH
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="kandidat-doc-empty text-xs text-gray-500 p-3 bg-gray-50 rounded border border-dashed border-gray-300">
                            Belum ada dokumen tambahan yang diunggah oleh kandidat.
                        </div>
                    )}
                </div>

                {/* ── Form Upload Surat Keputusan (SK) Resmi (HRD 22) ── */}
                <div className="kandidat-box">
                    <div className="flex items-center justify-between mb-3">
                        <div className="kandidat-box-label mb-0">Surat Keputusan (SK) Penerimaan</div>
                        {suratKeputusan ? (
                            <span className="text-[10px] font-bold bg-green-100 text-green-800 border border-green-300 px-2 py-0.5 rounded uppercase">
                                ✓ SK Terbit &amp; Diunggah
                            </span>
                        ) : (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded uppercase">
                                Belum Diunggah
                            </span>
                        )}
                    </div>

                    {suratKeputusan && !showSkUploadForm ? (
                        <div className="kandidat-doc-row bg-emerald-50/60 p-3 rounded border border-emerald-200 mb-3">
                            <div className="kandidat-doc-meta">
                                <span className="hrd-doc-icon bg-emerald-700 text-white font-bold text-[10px] px-1.5 py-0.5 rounded">
                                    PDF
                                </span>
                                <div>
                                    <div className="kandidat-doc-filename font-bold text-xs text-emerald-950">
                                        {suratKeputusan.file_dokumen || 'Surat_Keputusan_Penerimaan.pdf'}
                                    </div>
                                    <div className="text-[10px] text-emerald-800">
                                        Surat Keputusan Resmi • Diunggah: {suratKeputusan.tanggal_upload ? new Date(suratKeputusan.tanggal_upload).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID')}
                                    </div>
                                </div>
                            </div>
                            <div className="kandidat-doc-actions flex items-center gap-2">
                                <a
                                    href={route('hrd.kandidat.dokumen.view', suratKeputusan.id_dokumen)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn-secondary-sm text-xs cursor-pointer"
                                >
                                    LIHAT SK
                                </a>
                                <a
                                    href={route('hrd.kandidat.dokumen.download', suratKeputusan.id_dokumen)}
                                    download
                                    className="btn-primary-sm text-xs flex items-center gap-1 cursor-pointer"
                                >
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                                    </svg>
                                    UNDUH SK
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setShowSkUploadForm(true)}
                                    className="text-xs text-gray-600 hover:text-black font-semibold underline ml-1 cursor-pointer"
                                >
                                    Ganti File
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleUploadSk} className="p-3.5 bg-gray-50 border border-gray-300 rounded space-y-3">
                            <p className="text-xs text-gray-700 leading-relaxed">
                                Unggah berkas Surat Keputusan (SK) resmi dalam format <strong>PDF</strong>. Berkas ini dapat langsung diunduh oleh pelamar melalui portal kandidat setelah diterbitkan.
                            </p>
                            <div>
                                <label className="form-label-base block mb-1 font-bold text-xs">
                                    Pilih File Surat Keputusan (PDF, Maks 5MB) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
                                            if (!isPdf) {
                                                alert('Format file harus berupa PDF!');
                                                e.target.value = '';
                                                setSkData('file_sk', null);
                                                return;
                                            }
                                            setSkData('file_sk', file);
                                        }
                                    }}
                                    className="form-input-file w-full text-xs"
                                    required
                                />
                                {skErrors.file_sk && (
                                    <p className="form-error-base mt-1 text-xs">{skErrors.file_sk}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="submit"
                                    disabled={skProcessing}
                                    className="btn-primary text-xs !py-2 !px-4 uppercase font-bold tracking-wider cursor-pointer"
                                >
                                    {skProcessing ? 'Mengunggah...' : 'UNGGAH SURAT KEPUTUSAN'}
                                </button>
                                {suratKeputusan && (
                                    <button
                                        type="button"
                                        onClick={() => setShowSkUploadForm(false)}
                                        className="text-xs text-gray-600 hover:text-black underline ml-2 cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                )}
                            </div>
                        </form>
                    )}
                </div>

                {/* ── Action Buttons (HRD 20) ── */}
                {!isFinalStatus ? (
                    // Jika di Status Kandidat (Pending), HANYA ADA TOMBOL TERIMA DAN TOLAK (Tanpa tombol atur jadwal wawancara)
                    isStatusKandidatStage ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                onClick={() => handleAction('tolak')}
                                className="btn-secondary w-full cursor-pointer font-bold tracking-wider"
                            >
                                TOLAK
                            </button>
                            <button
                                onClick={() => handleAction('terima')}
                                className="btn-primary w-full cursor-pointer font-bold tracking-wider"
                            >
                                TERIMA
                            </button>
                        </div>
                    ) : (
                        // Jika di tahap Screening: terdapat pilihan Tolak, Jadwal Wawancara, atau Terima
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                                onClick={() => handleAction('tolak')}
                                className="btn-secondary w-full cursor-pointer font-bold tracking-wider"
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
                                className="btn-primary w-full cursor-pointer font-bold tracking-wider"
                            >
                                TERIMA
                            </button>
                        </div>
                    )
                ) : (
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => setIsReverting(true)}
                            className="btn-secondary text-xs uppercase tracking-wider font-bold cursor-pointer"
                        >
                            ↩ Kembalikan Status Kandidat
                        </button>
                    </div>
                )}
            </div>
        </KandidatDetailLayout>
    );
}
