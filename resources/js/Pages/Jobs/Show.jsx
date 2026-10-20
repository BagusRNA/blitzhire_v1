import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import PelamarModal from '@/Components/PelamarModal';

export default function JobShow({ job }) {
    const [isApplying, setIsApplying] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        nama: '',
        email: '',
        nomor_telepon: '',
        alamat: '',
        domisili: '',
        jenis_dokumen: 'CV / Resume',
        file_dokumen: null
    });

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
                        <button 
                            id="apply-now-btn"
                            onClick={() => setIsApplying(true)}
                            className="btn-primary"
                        >
                            Apply Now
                        </button>
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
                            accept=".pdf"
                            onChange={e => setData('file_dokumen', e.target.files[0])}
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
