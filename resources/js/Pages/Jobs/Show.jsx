import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import PelamarModal from '@/Components/PelamarModal';

export default function JobShow({ job, hasActiveApplication = false }) {
    const { auth, flash = {} } = usePage().props;
    const isHRD = Boolean(auth?.user && ('id_hrd' in auth.user || auth.user.role === 'hrd'));
    const pelamar = auth?.user && 'id_pelamar' in auth.user ? auth.user : null;
    const [isApplying, setIsApplying] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        nama: pelamar?.nama_lengkap ?? '',
        email: pelamar?.email ?? '',
        nomor_telepon: pelamar?.nomor_hp ?? '',
        alamat: pelamar?.alamat ?? '',
        domisili: pelamar?.alamat ?? '',
        jenis_dokumen: 'CV / Resume',
        file_dokumen: null
    });

    // Auto-fill data diri pelamar jika terdaftar (HRD 8)
    useEffect(() => {
        if (pelamar) {
            setData((prev) => ({
                ...prev,
                nama: prev.nama || pelamar.nama_lengkap || '',
                email: prev.email || pelamar.email || '',
                nomor_telepon: prev.nomor_telepon || pelamar.nomor_hp || '',
                alamat: prev.alamat || pelamar.alamat || '',
                domisili: prev.domisili || pelamar.alamat || '',
            }));
        }
    }, [pelamar]);

    const submitApplication = (e) => {
        e.preventDefault();
        post(route('pelamar.jobs.apply', job.id_lowongan), {
            onSuccess: () => {
                setIsApplying(false);
                reset();
            }
        });
    };

    return (
        <div className="job-detail-page">
            <Head title={`${job.judul_lowongan || job.posisi} - BlitzHire`} />
            
            <Header />

            <main className="job-detail-main">
                <div className="mb-4">
                    <button
                        type="button"
                        onClick={() => {
                            if (window.history.length > 1) {
                                window.history.back();
                            } else {
                                router.visit(isHRD ? '/hrd/kelola-job' : '/jobs');
                            }
                        }}
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black bg-white hover:bg-black hover:text-white py-2 px-4 rounded border-2 border-black shadow-xs transition duration-150 cursor-pointer"
                    >
                        ← Kembali
                    </button>
                </div>

                <div className="job-detail-card">
                    <div className="job-detail-header">
                        <div>
                            <h1 className="job-detail-title">{job.judul_lowongan || job.posisi}</h1>
                            <div className="job-detail-meta">
                                <span>📍 {job.lokasi}</span>
                                {job.departemen && <span>💼 {job.departemen}</span>}
                                <span className="badge-status-solid">{job.tipe_pekerjaan}</span>
                            </div>
                        </div>
                        {hasActiveApplication ? (
                            <div className="flex flex-col items-end">
                                <button 
                                    type="button"
                                    disabled
                                    className="px-4 py-2.5 rounded bg-gray-200 text-gray-600 text-xs font-bold uppercase tracking-wider cursor-not-allowed border border-gray-300 flex items-center gap-1.5"
                                    title="Anda sudah mendaftar lowongan ini dan sedang diproses oleh HRD"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    Sudah Dilamar (Sedang Diproses)
                                </button>
                                <span className="text-[11px] text-gray-500 mt-1">
                                    Lamaran Anda sedang dalam peninjauan oleh HRD.
                                </span>
                            </div>
                        ) : (
                            <button 
                                id="apply-now-btn"
                                onClick={() => setIsApplying(true)}
                                className="btn-primary"
                            >
                                Apply Now
                            </button>
                        )}
                    </div>

                    <div className="job-detail-content">
                        <div>
                            <h3 className="job-section-label">Job Description</h3>
                            <p className="job-section-text">{job.deskripsi}</p>
                        </div>
                        
                        <div>
                            <h3 className="job-section-label">Qualifications</h3>
                            <p className="job-section-text">{job.kualifikasi}</p>
                        </div>
                        
                        {(Number(job.gaji_min) > 0 || Number(job.gaji_max) > 0) && (
                            <div className="job-salary-card">
                                <h3 className="job-salary-label">Salary Range</h3>
                                <p className="job-salary-value">
                                    Rp {Number(job.gaji_min || 0).toLocaleString('id-ID')} - Rp {Number(job.gaji_max || 0).toLocaleString('id-ID')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Application Modal */}
            <PelamarModal
                isOpen={isApplying}
                onClose={() => setIsApplying(false)}
                title="Submit Application"
                maxWidth="max-w-lg"
            >
                <form onSubmit={submitApplication} className="job-apply-form">
                    {(errors.duplicate || flash?.error) && (
                        <div className="p-3 mb-4 bg-red-50 border border-red-300 text-red-700 text-xs font-semibold rounded">
                            {errors.duplicate || flash?.error}
                        </div>
                    )}
                    <div className="form-group">
                        <label className="form-label-base">Nama</label>
                        <input 
                            type="text" 
                            className="form-input-base" 
                            value={data.nama} 
                            onChange={e => setData('nama', e.target.value)} 
                        />
                        {errors.nama && <p className="form-error-base">{errors.nama}</p>}
                    </div>
                    <div className="form-group">
                        <label className="form-label-base">Email</label>
                        <input 
                            type="email" 
                            className="form-input-base" 
                            value={data.email} 
                            onChange={e => setData('email', e.target.value)} 
                        />
                        {errors.email && <p className="form-error-base">{errors.email}</p>}
                    </div>
                    <div className="form-group">
                        <label className="form-label-base">Nomor Telepon</label>
                        <input 
                            type="text" 
                            className="form-input-base" 
                            value={data.nomor_telepon} 
                            onChange={e => setData('nomor_telepon', e.target.value)} 
                        />
                        {errors.nomor_telepon && <p className="form-error-base">{errors.nomor_telepon}</p>}
                    </div>
                    <div className="form-group">
                        <label className="form-label-base">Alamat</label>
                        <textarea 
                            className="form-textarea-base" 
                            rows="2"
                            value={data.alamat} 
                            onChange={e => setData('alamat', e.target.value)} 
                        />
                        {errors.alamat && <p className="form-error-base">{errors.alamat}</p>}
                    </div>
                    <div className="form-group">
                        <label className="form-label-base">Domisili</label>
                        <textarea 
                            className="form-textarea-base" 
                            rows="2"
                            value={data.domisili} 
                            onChange={e => setData('domisili', e.target.value)} 
                        />
                        {errors.domisili && <p className="form-error-base">{errors.domisili}</p>}
                    </div>
                    <div className="form-group">
                        <label className="form-label-base">Document Type</label>
                        <input 
                            type="text" 
                            className="form-input-readonly" 
                            value={data.jenis_dokumen} 
                            readOnly 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label-base">Upload CV (PDF, Max 5MB)</label>
                        <input 
                            type="file" 
                            accept=".pdf,application/pdf"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
                                    if (!isPdf) {
                                        alert('Format file tidak tepat! Harap unggah berkas berformat PDF.');
                                        e.target.value = '';
                                        setData('file_dokumen', null);
                                        return;
                                    }
                                    setData('file_dokumen', file);
                                }
                            }}
                            className="form-input-file" 
                            required
                        />
                        {errors.file_dokumen && <p className="form-error-base">{errors.file_dokumen}</p>}
                    </div>

                    <div className="job-apply-actions">
                        <button 
                            type="button" 
                            onClick={() => setIsApplying(false)} 
                            className="btn-secondary"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            disabled={processing} 
                            className="btn-primary"
                        >
                            {processing ? 'Submitting...' : 'Confirm Application'}
                        </button>
                    </div>
                </form>
            </PelamarModal>
            
            <Footer />
        </div>
    );
}
