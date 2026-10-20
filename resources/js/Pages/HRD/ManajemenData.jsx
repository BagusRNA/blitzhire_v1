import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import HRDLayout from "@/Layouts/HRDLayout";
import StatusBadge from "@/Components/StatusBadge";

export default function ManajemenData({ pelamar = [], flash }) {
    const [selectedIds, setSelectedIds] = useState([]);
    const [view, setView] = useState("diterima"); // 'diterima' | 'pelamar'

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    const toggleAll = () => {
        if (selectedIds.length === pelamar.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(pelamar.map((p) => p.id_lamaran));
        }
    };

    const handleDelete = (id_lamaran) => {
        if (!confirm("Hapus data pelamar ini?")) return;
        router.delete(route("hrd.manajemen-data.destroy", id_lamaran), {
            preserveScroll: true,
        });
    };

    const printLaporan = (type) => {
        window.open(`/hrd/laporan/${type}?format=print`, "_blank");
    };

    return (
        <HRDLayout title="Manajemen Data">
            <div className="hrd-page-section">
                <div className="hrd-section-label">MANAJEMEN DATA</div>

                {flash?.success && (
                    <div className="hrd-flash-success">{flash.success}</div>
                )}

                {/* Action Bar */}
                <div className="hrd-data-toolbar">
                    <div className="hrd-data-toolbar-left">
                        <button
                            onClick={() => printLaporan("pelamar")}
                            className="hrd-laporan-btn"
                        >
                            Cetak Laporan Pelamar
                        </button>
                        <button
                            onClick={() => printLaporan("wawancara")}
                            className="hrd-laporan-btn"
                        >
                            Cetak Laporan Wawancara
                        </button>
                        <button
                            onClick={() => printLaporan("diterima")}
                            className="hrd-laporan-btn"
                        >
                            Cetak Laporan Pelamar Diterima
                        </button>
                    </div>
                    <div className="hrd-data-toolbar-right">
                        <select className="hrd-filter-select">
                            <option>Filter</option>
                            <option>Full-Time</option>
                            <option>Magang / PKL</option>
                        </select>
                        <select className="hrd-filter-select">
                            <option>Filter</option>
                            <option>Pending</option>
                            <option>Diterima</option>
                            <option>Ditolak</option>
                            <option>Screening</option>
                        </select>
                        <button className="hrd-filter-apply-btn">Filter</button>
                    </div>
                </div>

                {/* View: Diterima (default) */}
                {view === "diterima" && (
                    <div className="hrd-data-table-wrap">
                        <table className="hrd-table">
                            <thead className="hrd-table-head">
                                <tr>
                                    <th className="hrd-table-th">Email</th>
                                    <th className="hrd-table-th">Alamat</th>
                                    <th className="hrd-table-th">Domisili</th>
                                    <th className="hrd-table-th">Dokumen</th>
                                    <th className="hrd-table-th">
                                        Tanggal Lamar
                                    </th>
                                    <th className="hrd-table-th">Status</th>
                                    <th className="hrd-table-th">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="hrd-table-body">
                                {pelamar.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="hrd-table-empty"
                                        >
                                            Tidak ada data.
                                        </td>
                                    </tr>
                                ) : (
                                    pelamar.map((item) => (
                                        <tr
                                            key={item.id_lamaran}
                                            className="hrd-table-tr"
                                        >
                                            <td className="hrd-table-td text-sm">
                                                {item.pelamar?.email ?? "—"}
                                            </td>
                                            <td className="hrd-table-td text-sm">
                                                {item.pelamar?.alamat ?? "—"}
                                            </td>
                                            <td className="hrd-table-td text-sm">
                                                {item.pelamar?.domisili ??
                                                    item.pelamar?.alamat ??
                                                    "—"}
                                            </td>
                                            <td className="hrd-table-td">
                                                {item.dokumen?.length > 0 ? (
                                                    <div className="hrd-doc-list">
                                                        {item.dokumen.map(
                                                            (doc) => (
                                                                <a
                                                                    key={
                                                                        doc.id_dokumen
                                                                    }
                                                                    href={`/storage/${doc.path_file}`}
                                                                    target="_blank"
                                                                    className="hrd-doc-link"
                                                                >
                                                                    <span className="hrd-doc-icon">
                                                                        DOC
                                                                    </span>
                                                                    {
                                                                        doc.jenis_dokumen
                                                                    }
                                                                </a>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="hrd-table-td text-sm">
                                                {item.tanggal_lamaran
                                                    ? new Date(
                                                          item.tanggal_lamaran,
                                                      ).toLocaleDateString(
                                                          "id-ID",
                                                          {
                                                              day: "numeric",
                                                              month: "long",
                                                              year: "numeric",
                                                          },
                                                      )
                                                    : "—"}
                                            </td>
                                            <td className="hrd-table-td">
                                                <StatusBadge
                                                    status={item.status_lamaran}
                                                />
                                            </td>
                                            <td className="hrd-table-td text-center">
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            item.id_lamaran,
                                                        )
                                                    }
                                                    className="hrd-delete-btn"
                                                    title="Hapus"
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
                )}

                {/* View: All Pelamar (with checkbox & REF) */}
                {view === "pelamar" && (
                    <div className="hrd-data-table-wrap">
                        <table className="hrd-table">
                            <thead className="hrd-table-head">
                                <tr>
                                    <th className="hrd-table-th w-8">
                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedIds.length ===
                                                    pelamar.length &&
                                                pelamar.length > 0
                                            }
                                            onChange={toggleAll}
                                            className="hrd-checkbox"
                                        />
                                    </th>
                                    <th className="hrd-table-th">REF</th>
                                    <th className="hrd-table-th">
                                        Nama Lengkap
                                    </th>
                                    <th className="hrd-table-th">No. HP</th>
                                    <th className="hrd-table-th">Email</th>
                                    <th className="hrd-table-th">Alamat</th>
                                    <th className="hrd-table-th">Domisili</th>
                                    <th className="hrd-table-th">Dokumen</th>
                                </tr>
                            </thead>
                            <tbody className="hrd-table-body">
                                {pelamar.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="hrd-table-empty"
                                        >
                                            Tidak ada data.
                                        </td>
                                    </tr>
                                ) : (
                                    pelamar.map((item, idx) => (
                                        <tr
                                            key={item.id_lamaran}
                                            className="hrd-table-tr"
                                        >
                                            <td className="hrd-table-td">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(
                                                        item.id_lamaran,
                                                    )}
                                                    onChange={() =>
                                                        toggleSelect(
                                                            item.id_lamaran,
                                                        )
                                                    }
                                                    className="hrd-checkbox"
                                                />
                                            </td>
                                            <td className="hrd-table-td hrd-table-ref">
                                                #
                                                {String(idx + 1).padStart(
                                                    3,
                                                    "0",
                                                )}
                                            </td>
                                            <td className="hrd-table-td font-medium">
                                                {item.pelamar?.nama_lengkap ??
                                                    "—"}
                                            </td>
                                            <td className="hrd-table-td text-sm">
                                                {item.pelamar?.nomor_hp
                                                    ? item.pelamar.nomor_hp.replace(
                                                          /\d(?=\d{4})/g,
                                                          "*",
                                                      )
                                                    : "—"}
                                            </td>
                                            <td className="hrd-table-td text-sm">
                                                {item.pelamar?.email ?? "—"}
                                            </td>
                                            <td className="hrd-table-td text-sm">
                                                {item.pelamar?.alamat ?? "—"}
                                            </td>
                                            <td className="hrd-table-td text-sm">
                                                {item.pelamar?.domisili ??
                                                    item.pelamar?.alamat ??
                                                    "—"}
                                            </td>
                                            <td className="hrd-table-td">
                                                {item.dokumen?.length > 0 ? (
                                                    <div className="hrd-doc-list">
                                                        {item.dokumen.map(
                                                            (doc) => (
                                                                <a
                                                                    key={
                                                                        doc.id_dokumen
                                                                    }
                                                                    href={`/storage/${doc.path_file}`}
                                                                    target="_blank"
                                                                    className="hrd-doc-link"
                                                                >
                                                                    <span className="hrd-doc-icon">
                                                                        DOC
                                                                    </span>
                                                                    {
                                                                        doc.jenis_dokumen
                                                                    }
                                                                </a>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Toggle view */}
                <div className="mt-4 flex gap-2">
                    <button
                        onClick={() => setView("diterima")}
                        className={`hrd-view-toggle-btn ${view === "diterima" ? "hrd-view-toggle-btn--active" : ""}`}
                    >
                        View: Status & Aksi
                    </button>
                    <button
                        onClick={() => setView("pelamar")}
                        className={`hrd-view-toggle-btn ${view === "pelamar" ? "hrd-view-toggle-btn--active" : ""}`}
                    >
                        View: REF & Dokumen
                    </button>
                </div>
            </div>
        </HRDLayout>
    );
}
