import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import HRDLayout from "@/Layouts/HRDLayout";
import StatusBadge from "@/Components/StatusBadge";

export default function ManajemenData({ pelamar = [], flash }) {
    // Selection state
    const [selectedIds, setSelectedIds] = useState([]);

    // Filter controls: selection in dropdown vs applied filter
    const [selectedTipe, setSelectedTipe] = useState("Semua");
    const [selectedStatus, setSelectedStatus] = useState("Semua");
    const [appliedTipe, setAppliedTipe] = useState("Semua");
    const [appliedStatus, setAppliedStatus] = useState("Semua");

    // Modal state for delete confirmation (IR10 / TC56 & TC57)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    // Filter action (TC54 & HRD 11)
    const handleTipeChange = (val) => {
        setSelectedTipe(val);
        setAppliedTipe(val);
    };

    const handleStatusChange = (val) => {
        setSelectedStatus(val);
        setAppliedStatus(val);
    };

    const handleApplyFilter = () => {
        setAppliedTipe(selectedTipe);
        setAppliedStatus(selectedStatus);
    };

    const handleResetFilter = () => {
        setSelectedTipe("Semua");
        setSelectedStatus("Semua");
        setAppliedTipe("Semua");
        setAppliedStatus("Semua");
    };

    // Filter logic
    const filteredPelamar = pelamar.filter((item) => {
        if (appliedTipe !== "Semua") {
            const tipe = item.lowongan?.tipe_pekerjaan ?? "";
            if (appliedTipe === "Full-Time" && tipe !== "Full-Time") return false;
            if (appliedTipe === "Magang / PKL" && !["Magang", "PKL", "Magang / PKL", "Internship"].includes(tipe)) return false;
        }

        if (appliedStatus !== "Semua") {
            if (appliedStatus === "Penawaran") {
                if (!["Penawaran", "Offer"].includes(item.status_lamaran)) return false;
            } else if (appliedStatus === "Wawancara") {
                if (!["Wawancara", "Interview"].includes(item.status_lamaran)) return false;
            } else {
                if (item.status_lamaran !== appliedStatus) return false;
            }
        }

        return true;
    });

    // Checkbox selection
    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedIds.length === filteredPelamar.length && filteredPelamar.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredPelamar.map((p) => p.id_lamaran));
        }
    };

    // Delete confirmation modal actions (TC56 & TC57)
    const openDeleteModal = (id_lamaran) => {
        setDeleteTargetId(id_lamaran);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setDeleteTargetId(null);
    };

    const confirmDelete = () => {
        if (!deleteTargetId) return;

        router.delete(route("hrd.manajemen-data.destroy", deleteTargetId), {
            preserveScroll: true,
            onSuccess: () => {
                closeDeleteModal();
                alert("Data berhasil dihapus!");
            },
        });
    };

    // Reports with active filter query params (IR12, IR13, IR14 & HRD 11)
    const printLaporan = (type) => {
        const params = new URLSearchParams();
        params.append("format", "print");
        const t = appliedTipe !== "Semua" ? appliedTipe : selectedTipe;
        const s = appliedStatus !== "Semua" ? appliedStatus : selectedStatus;
        if (t !== "Semua") params.append("type", t);
        if (s !== "Semua") params.append("status", s);
        window.open(`/hrd/laporan/${type}?${params.toString()}`, "_blank");
    };

    return (
        <HRDLayout title="Manajemen Data">
            <div className="hrd-page-section">
                <div className="hrd-section-label">MANAJEMEN DATA</div>

                {flash?.success && (
                    <div className="hrd-flash-success mb-4">{flash.success}</div>
                )}

                {/* Action Bar */}
                <div className="hrd-data-toolbar">
                    <div className="hrd-data-toolbar-left flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => printLaporan("pelamar")}
                            className="hrd-laporan-btn"
                        >
                            Cetak Laporan Pelamar
                        </button>
                        <button
                            type="button"
                            onClick={() => printLaporan("wawancara")}
                            className="hrd-laporan-btn"
                        >
                            Cetak Laporan Wawancara
                        </button>
                        <button
                            type="button"
                            onClick={() => printLaporan("diterima")}
                            className="hrd-laporan-btn"
                        >
                            Cetak Laporan Pelamar Diterima
                        </button>
                    </div>

                    {/* Filter controls (TC54, TC55, HRD 11) */}
                    <div className="hrd-data-toolbar-right flex flex-wrap items-center gap-2">
                        <select
                            className="hrd-filter-select"
                            value={selectedTipe}
                            onChange={(e) => handleTipeChange(e.target.value)}
                        >
                            <option value="Semua">Semua Tipe Pekerjaan</option>
                            <option value="Full-Time">Full-Time</option>
                            <option value="Magang / PKL">Magang / PKL</option>
                        </select>

                        <select
                            className="hrd-filter-select"
                            value={selectedStatus}
                            onChange={(e) => handleStatusChange(e.target.value)}
                        >
                            <option value="Semua">Semua Status</option>
                            <option value="Screening">Screening</option>
                            <option value="Wawancara">Wawancara</option>
                            <option value="Penawaran">Penawaran</option>
                            <option value="Diterima">Diterima</option>
                            <option value="Ditolak">Ditolak</option>
                            <option value="Pending">Pending</option>
                        </select>

                        <button
                            type="button"
                            onClick={handleApplyFilter}
                            className="hrd-filter-apply-btn"
                        >
                            Filter
                        </button>

                        {(appliedTipe !== "Semua" || appliedStatus !== "Semua") && (
                            <button
                                type="button"
                                onClick={handleResetFilter}
                                className="px-3 py-1.5 text-xs text-gray-500 hover:text-black border border-gray-300 rounded bg-white hover:bg-gray-100 font-medium"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter info indicator */}
                {(appliedTipe !== "Semua" || appliedStatus !== "Semua") && (
                    <div className="mb-3 text-xs text-gray-600 bg-gray-100 p-2 rounded flex items-center justify-between">
                        <span>
                            Filter Aktif: Tipe = <strong>{appliedTipe}</strong> | Status = <strong>{appliedStatus}</strong> (Ditemukan: {filteredPelamar.length} data)
                        </span>
                        <button onClick={handleResetFilter} className="text-blue-600 hover:underline text-xs">
                            Hapus Filter
                        </button>
                    </div>
                )}

                {/* IR8 (TC53): Single Unified Table (No duplicate views) */}
                <div className="hrd-data-table-wrap">
                    <table className="hrd-table">
                        <thead className="hrd-table-head">
                            <tr>
                                <th className="hrd-table-th w-8 text-center">
                                    <input
                                        type="checkbox"
                                        checked={
                                            selectedIds.length === filteredPelamar.length &&
                                            filteredPelamar.length > 0
                                        }
                                        onChange={toggleAll}
                                        className="hrd-checkbox"
                                    />
                                </th>
                                <th className="hrd-table-th text-center w-14">REF</th>
                                <th className="hrd-table-th">Nama Pelamar</th>
                                <th className="hrd-table-th">Kontak (Email / No. HP)</th>
                                <th className="hrd-table-th">Alamat / Domisili</th>
                                <th className="hrd-table-th">Posisi Lowongan</th>
                                <th className="hrd-table-th">Dokumen</th>
                                <th className="hrd-table-th">Tanggal Lamar</th>
                                <th className="hrd-table-th text-center">Status</th>
                                <th className="hrd-table-th text-center w-16">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="hrd-table-body">
                            {filteredPelamar.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="hrd-table-empty">
                                        Tidak ada data pelamar yang sesuai.
                                    </td>
                                </tr>
                            ) : (
                                filteredPelamar.map((item, idx) => (
                                    <tr key={item.id_lamaran} className="hrd-table-tr hover:bg-gray-50/80">
                                        {/* Checkbox */}
                                        <td className="hrd-table-td text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(item.id_lamaran)}
                                                onChange={() => toggleSelect(item.id_lamaran)}
                                                className="hrd-checkbox"
                                            />
                                        </td>

                                        {/* REF */}
                                        <td className="hrd-table-td hrd-table-ref text-center">
                                            #{String(idx + 1).padStart(3, "0")}
                                        </td>

                                        {/* Nama Pelamar */}
                                        <td className="hrd-table-td font-semibold text-gray-900">
                                            {item.pelamar?.nama_lengkap ?? "—"}
                                        </td>

                                        {/* Kontak (Email / No. HP) */}
                                        <td className="hrd-table-td text-xs">
                                            <div className="font-mono text-gray-800">{item.pelamar?.email ?? "—"}</div>
                                            <div className="text-gray-500 mt-0.5">
                                                {item.pelamar?.nomor_hp ?? item.pelamar?.no_telepon ?? "—"}
                                            </div>
                                        </td>

                                        {/* Alamat / Domisili */}
                                        <td className="hrd-table-td text-xs text-gray-700 max-w-[200px] truncate">
                                            {item.pelamar?.domisili ?? item.pelamar?.alamat ?? "—"}
                                        </td>

                                        {/* Posisi & Tipe Lowongan */}
                                        <td className="hrd-table-td text-xs">
                                            <div className="font-medium text-gray-900">
                                                {item.lowongan?.judul_lowongan ?? item.lowongan?.posisi ?? "—"}
                                            </div>
                                            <div className="text-[11px] text-gray-500">
                                                {item.lowongan?.tipe_pekerjaan ?? "—"}
                                            </div>
                                        </td>

                                        {/* Dokumen CV */}
                                        <td className="hrd-table-td">
                                            {item.dokumen?.length > 0 ? (
                                                <div className="hrd-doc-list">
                                                    {item.dokumen.map((doc) => (
                                                        <a
                                                            key={doc.id_dokumen}
                                                            href={`/storage/${doc.path_file}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="hrd-doc-link inline-flex items-center gap-1"
                                                        >
                                                            <span className="hrd-doc-icon">DOC</span>
                                                            <span className="truncate max-w-[120px]">{doc.file_dokumen || doc.jenis_dokumen}</span>
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs">—</span>
                                            )}
                                        </td>

                                        {/* Tanggal Lamar */}
                                        <td className="hrd-table-td text-xs text-gray-600 whitespace-nowrap">
                                            {item.tanggal_lamaran
                                                ? new Date(item.tanggal_lamaran).toLocaleDateString("id-ID", {
                                                      day: "numeric",
                                                      month: "short",
                                                      year: "numeric",
                                                  })
                                                : "—"}
                                        </td>

                                        {/* Status */}
                                        <td className="hrd-table-td text-center">
                                            <StatusBadge status={item.status_lamaran} />
                                        </td>

                                        {/* Aksi Hapus */}
                                        <td className="hrd-table-td text-center">
                                            <button
                                                type="button"
                                                onClick={() => openDeleteModal(item.id_lamaran)}
                                                className="hrd-delete-btn p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                                title="Hapus Pelamar"
                                            >
                                                🗑
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* IR10 (TC56 & TC57): Delete Confirmation Modal ("Yakin hapus?") */}
                {deleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-150">
                            <div className="flex items-center gap-3 mb-4 text-red-600">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center font-bold text-lg">
                                    ⚠️
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">Yakin hapus?</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Konfirmasi penghapusan data pelamar</p>
                                </div>
                            </div>

                            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                                Apakah Anda yakin ingin menghapus data pelamar ini dari sistem dan database? Tindakan ini tidak dapat dibatalkan.
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeDeleteModal}
                                    className="px-4 py-2 text-xs font-bold uppercase rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 tracking-wider"
                                >
                                    Tidak
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDelete}
                                    className="px-4 py-2 text-xs font-bold uppercase rounded bg-red-600 hover:bg-red-700 text-white tracking-wider shadow-xs"
                                >
                                    Ya
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </HRDLayout>
    );
}
