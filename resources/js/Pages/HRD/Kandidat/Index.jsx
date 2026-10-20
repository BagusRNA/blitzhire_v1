import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import HRDLayout from '@/Layouts/HRDLayout';
import PelamarModal from '@/Components/PelamarModal';
import StatusBadge from '@/Components/StatusBadge';

export default function KandidatIndex({ kandidat, id_lowongan }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLamaran, setSelectedLamaran] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        tanggal_wawancara: '',
        lokasi: '',
        interviewer: '',
        format_wawancara: 'Online',
        link_meeting: '',
        catatan: ''
    });

    const openInterviewModal = (lamaranId) => {
        setSelectedLamaran(lamaranId);
        setIsModalOpen(true);
    };

    const closeInterviewModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const submitInterview = (e) => {
        e.preventDefault();
        post(route('hrd.kandidat.schedule', selectedLamaran), {
            onSuccess: () => closeInterviewModal(),
        });
    };

    const updateStatus = (id_lamaran, newStatus) => {
        router.post(route('hrd.kandidat.update_status', id_lamaran), {
            status_lamaran: newStatus
        });
    };

    return (
        <HRDLayout title="Candidate Management">
            <div className="flex flex-col gap-4">

                {/* ── Page Title ── */}
                <div className="hrd-page-inline-wrap">
                    <h1 className="hrd-page-inline-title">Candidate Management</h1>
                    <div className="hrd-page-inline-line"></div>
                </div>

                {/* ── Candidates Table ── */}
                <div className="hrd-data-table-wrap">
                    <table className="hrd-table">
                        <thead className="hrd-table-head">
                            <tr>
                                <th className="hrd-table-th">Candidate Name</th>
                                <th className="hrd-table-th">Documents</th>
                                <th className="hrd-table-th">Status</th>
                                <th className="hrd-table-th text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="hrd-table-body">
                            {kandidat?.length > 0 ? (
                                kandidat.map((lamaran) => (
                                    <tr key={lamaran.id_lamaran} className="hrd-table-tr">
                                        <td className="hrd-table-td">
                                            <div className="hrd-table-name">{lamaran.pelamar.nama_lengkap}</div>
                                            <div className="text-xs text-gray-500">{lamaran.pelamar.email}</div>
                                        </td>
                                        <td className="hrd-table-td">
                                            {lamaran.dokumen?.map((doc) => (
                                                <a
                                                    key={doc.id_dokumen}
                                                    href={`/storage/${doc.path_file}`}
                                                    target="_blank"
                                                    className="hrd-doc-link"
                                                >
                                                    <span className="hrd-doc-icon">PDF</span>
                                                    {doc.jenis_dokumen}
                                                </a>
                                            ))}
                                            {lamaran.dokumen?.length === 0 && (
                                                <span className="text-gray-400 text-xs">No Documents</span>
                                            )}
                                        </td>
                                        <td className="hrd-table-td">
                                            <StatusBadge status={lamaran.status_lamaran} />
                                        </td>
                                        <td className="hrd-table-td text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => updateStatus(lamaran.id_lamaran, 'Interview')}
                                                    className="btn-secondary-sm"
                                                >
                                                    To Interview
                                                </button>
                                                <button
                                                    onClick={() => openInterviewModal(lamaran.id_lamaran)}
                                                    className="btn-primary-sm"
                                                >
                                                    Schedule
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="hrd-table-empty">
                                        No candidates found for this job.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Interview Scheduling Modal */}
            <PelamarModal
                isOpen={isModalOpen}
                onClose={closeInterviewModal}
                title="Schedule Interview"
            >
                <form onSubmit={submitInterview} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="form-label-base">Date &amp; Time</label>
                        <input
                            type="datetime-local"
                            className="form-input-base"
                            value={data.tanggal_wawancara}
                            onChange={e => setData('tanggal_wawancara', e.target.value)}
                            required
                        />
                        {errors.tanggal_wawancara && (
                            <span className="form-error-base">{errors.tanggal_wawancara}</span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="form-label-base">Format</label>
                            <select
                                className="form-select-base"
                                value={data.format_wawancara}
                                onChange={e => setData('format_wawancara', e.target.value)}
                            >
                                <option value="Online">Online</option>
                                <option value="Offline">Offline</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="form-label-base">Interviewer</label>
                            <input
                                type="text"
                                className="form-input-base"
                                value={data.interviewer}
                                onChange={e => setData('interviewer', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="form-label-base">Location / Meeting Link</label>
                        <input
                            type="text"
                            className="form-input-base"
                            value={data.format_wawancara === 'Online' ? data.link_meeting : data.lokasi}
                            onChange={e => data.format_wawancara === 'Online'
                                ? setData('link_meeting', e.target.value)
                                : setData('lokasi', e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={closeInterviewModal}
                            className="btn-secondary-sm py-2 px-5"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="btn-primary-sm py-2 px-5"
                        >
                            {processing ? 'Scheduling...' : 'Confirm Schedule'}
                        </button>
                    </div>
                </form>
            </PelamarModal>
        </HRDLayout>
    );
}
