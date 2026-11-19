import React, { useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import HRDLayout from "@/Layouts/HRDLayout";
import PelamarModal from "@/Components/PelamarModal";

const STATUS_COLUMNS = [
    { key: "Screening", label: "SCREENING" },
    { key: "Wawancara", label: "WAWANCARA" },
    { key: "Penawaran", label: "PENAWARAN" },
    { key: "Final", label: "STATUS KANDIDAT" },
];

const FINAL_STATUS_MAP = {
    Pending: { label: "PENDING", cls: "hrd-badge-pending" },
    Diterima: { label: "HIRED", cls: "hrd-badge-hired" },
    Ditolak: { label: "REJECTED", cls: "hrd-badge-rejected" },
};

export default function ManajemenKandidat({ lamaran = [], confirmedInterviews = [], flash }) {
    const [filterTipe, setFilterTipe] = useState("Semua");
    const [tahapFilter, setTahapFilter] = useState("Semua");
    const [showTahapDropdown, setShowTahapDropdown] = useState(false);
    const [scheduleModal, setScheduleModal] = useState(null); // id_lamaran | null
    const [revertModalItem, setRevertModalItem] = useState(null);
    const [revertTargetStatus, setRevertTargetStatus] = useState("Screening");
    const [candidateName, setCandidateName] = useState("");

    const tipeOptions = ["Semua", "Full-Time", "Magang / PKL"];

    // ── Form ──────────────────────────────────────────────────────────
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            tanggal_wawancara: "",
            format_wawancara: "Online",
            interviewer: "",
            link_meeting: "",
            lokasi: "",
            catatan: "",
        });

    const openModal = (id_lamaran, nama) => {
        reset();
        clearErrors();
        setCandidateName(nama);
        setScheduleModal(id_lamaran);
    };

    const closeModal = () => {
        setScheduleModal(null);
        reset();
        clearErrors();
    };

    const submitSchedule = (e) => {
        e.preventDefault();
        post(route("hrd.kandidat.schedule", scheduleModal), {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                alert('Jadwal wawancara telah dibuat.');
            },
        });
    };

    // ── Filter & group ────────────────────────────────────────────────
    const filtered =
        filterTipe === "Semua"
            ? lamaran
            : lamaran.filter((l) => {
                  const tipe = l.lowongan?.tipe_pekerjaan ?? "";
                  if (filterTipe === "Full-Time") return tipe === "Full-Time";
                  if (filterTipe === "Magang / PKL")
                      return ["Magang", "PKL", "Magang / PKL"].includes(tipe);
                  return true;
              });

    const isOfferStatus = (value) => ["Penawaran", "Offer"].includes(value);

    const byStatus = (status) =>
        filtered.filter((l) => {
            if (status === "Final")
                return (
                    l.status_lamaran === "Pending" ||
                    l.status_lamaran === "Diterima" ||
                    l.status_lamaran === "Ditolak"
                );
            if (status === "Wawancara")
                return (
                    l.status_lamaran === "Wawancara" ||
                    l.status_lamaran === "Interview"
                );
            if (status === "Penawaran") return isOfferStatus(l.status_lamaran);
            return l.status_lamaran === status;
        });

    const formatJadwal = (wawancara) => {
        if (!wawancara?.length) return null;
        const latest = wawancara[wawancara.length - 1];
        if (!latest.tanggal_wawancara) return null;
        const d = new Date(latest.tanggal_wawancara);
        return `${d.toLocaleDateString("id-ID")} ${d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
    };

    const getReviewRoute = (item) => {
        if (["Wawancara", "Interview"].includes(item.status_lamaran)) {
            return route("hrd.kandidat.status_wawancara", item.id_lamaran);
        }

        if (isOfferStatus(item.status_lamaran)) {
            return route("hrd.kandidat.penawaran", item.id_lamaran);
        }

        return route("hrd.kandidat.detail", item.id_lamaran);
    };

    const getActionButton = (item, colKey) => {
        if (colKey === "Screening") {
            return (
                <button
                    type="button"
                    onClick={() =>
                        openModal(
                            item.id_lamaran,
                            item.pelamar?.nama_lengkap ?? "—",
                        )
                    }
                    className="hrd-kcard-schedule-btn"
                >
                    + Schedule Interview
                </button>
            );
        }

        if (colKey === "Wawancara") {
            return (
                <Link
                    href={route("hrd.kandidat.jadwal_ulang", item.id_lamaran)}
                    className="hrd-kcard-schedule-btn"
                >
                    + RESCHEDULE
                </Link>
            );
        }

        if (colKey === "Penawaran") {
            return (
                <Link
                    href={route("hrd.kandidat.penawaran", item.id_lamaran)}
                    className="hrd-kcard-schedule-btn"
                >
                    + OFFER
                </Link>
            );
        }

        if (colKey === "Final") {
            return (
                <button
                    type="button"
                    onClick={() => setRevertModalItem(item)}
                    className="hrd-kcard-schedule-btn !border-gray-500 !text-gray-700 hover:!bg-gray-100 cursor-pointer"
                    title="Ubah atau kembalikan status kandidat"
                >
                    ↩ Kembalikan Status
                </button>
            );
        }

        return null;
    };

    const displayedColumns = tahapFilter === "Semua"
        ? STATUS_COLUMNS
        : STATUS_COLUMNS.filter((col) => col.key === tahapFilter);

    return (
        <HRDLayout title="Manajemen Kandidat">
            <div className="hrd-page-section">
                <div className="hrd-section-label">MANAJEMEN KANDIDAT</div>

                {flash?.success && (
                    <div className="hrd-flash-success">{flash.success}</div>
                )}

                {/* ── Notification Banner: Pelamar Menerima Jadwal Wawancara (HRD 9) ── */}
                {confirmedInterviews && confirmedInterviews.length > 0 && (
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 mb-4 rounded-r shadow-xs">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-emerald-800 font-bold text-xs uppercase tracking-wide flex items-center gap-1.5">
                                🔔 Pelamar Menerima Jadwal Wawancara ({confirmedInterviews.length})
                            </span>
                        </div>
                        <div className="space-y-1.5">
                            {confirmedInterviews.map((item) => (
                                <div key={item.id_lamaran} className="text-xs text-emerald-900 flex items-center justify-between">
                                    <span>
                                        <strong>{item.pelamar?.nama_lengkap}</strong> telah mengonfirmasi kehadiran wawancara untuk posisi <em>{item.lowongan?.judul_lowongan || item.lowongan?.posisi}</em>.
                                    </span>
                                    <Link
                                        href={route("hrd.kandidat.status_wawancara", item.id_lamaran)}
                                        className="text-[11px] font-bold text-emerald-800 underline hover:text-emerald-950 ml-3 whitespace-nowrap"
                                    >
                                        Lihat Detail →
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Filter Bar (HRD 4 & HRD 5) ── */}
                <div className="hrd-filter-bar">
                    <span className="hrd-filter-label">FILTER:</span>
                    
                    {/* Dropdown Filter Tahapan Rekrutmen (HRD 5) */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowTahapDropdown(!showTahapDropdown)}
                            className="hrd-filter-dropdown-btn cursor-pointer bg-white"
                        >
                            <span>Tahap: {tahapFilter === "Semua" ? "Semua Tahap" : (STATUS_COLUMNS.find(c => c.key === tahapFilter)?.label || tahapFilter)}</span>
                            <span className="text-[10px]">▼</span>
                        </button>
                        {showTahapDropdown && (
                            <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-300 rounded shadow-lg z-20 py-1 text-xs">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTahapFilter("Semua");
                                        setShowTahapDropdown(false);
                                    }}
                                    className={`w-full text-left px-3 py-1.5 hover:bg-orange-50 hover:text-orange-600 transition ${tahapFilter === "Semua" ? "font-bold text-orange-600 bg-orange-50" : "text-gray-700"}`}
                                >
                                    Semua Tahap
                                </button>
                                {STATUS_COLUMNS.map((col) => (
                                    <button
                                        key={col.key}
                                        type="button"
                                        onClick={() => {
                                            setTahapFilter(col.key);
                                            setShowTahapDropdown(false);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 hover:bg-orange-50 hover:text-orange-600 transition ${tahapFilter === col.key ? "font-bold text-orange-600 bg-orange-50" : "text-gray-700"}`}
                                    >
                                        {col.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Filter Kategori / Tipe Lowongan (HRD 4 Highlight Orange) */}
                    {tipeOptions.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => setFilterTipe(opt)}
                            className={`hrd-filter-chip ${filterTipe === opt ? "hrd-filter-chip--active" : ""}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {/* ── Kanban Board ── */}
                <div className="hrd-kanban-wrapper">
                    <div className="hrd-kanban-board">
                        {displayedColumns.map((col) => {
                            const cards = byStatus(col.key);
                            return (
                                <div key={col.key} className="hrd-kanban-col">
                                    <div className="hrd-kanban-col-header">
                                        <span className="hrd-kanban-col-title">
                                            {col.label}
                                        </span>
                                        <span className="hrd-kanban-col-count">
                                            {cards.length}
                                        </span>
                                    </div>
                                    <div className="hrd-kanban-cards">
                                        {cards.length === 0 && (
                                            <p className="hrd-kanban-empty">
                                                Tidak ada kandidat.
                                            </p>
                                        )}
                                        {cards.map((item) => {
                                            const isFinal = col.key === "Final";
                                            const finalInfo =
                                                FINAL_STATUS_MAP[
                                                    item.status_lamaran
                                                ];
                                            const dtStr = formatJadwal(
                                                item.wawancara,
                                            );

                                            return (
                                                <div
                                                    key={item.id_lamaran}
                                                    className="hrd-kanban-card"
                                                >
                                                    {/* Name & position */}
                                                    <div className="hrd-kcard-name">
                                                        {item.pelamar
                                                            ?.nama_lengkap ??
                                                            "—"}
                                                    </div>
                                                    <div className="hrd-kcard-posisi">
                                                        {item.lowongan
                                                            ?.judul_lowongan ??
                                                            item.lowongan
                                                            ?.posisi ?? "—"}
                                                    </div>

                                                    {/* ATS badge */}
                                                    <div className="hrd-kcard-ats">
                                                        <span className="hrd-ats-badge-sm">
                                                            {item.skor_kecocokan ??
                                                                "—"}
                                                            %
                                                        </span>
                                                    </div>

                                                    {/* Footer row */}
                                                    <div className="hrd-kcard-footer">
                                                        {col.key ===
                                                            "Wawancara" ? (
                                                            <div className="flex flex-col gap-0.5">
                                                                {dtStr && (
                                                                    <span className="hrd-kcard-meta">
                                                                        {dtStr}
                                                                    </span>
                                                                )}
                                                                {(() => {
                                                                    const latest = item.wawancara?.[item.wawancara.length - 1];
                                                                    const isConfirmed = latest?.status_wawancara === 'Terkonfirmasi' ||
                                                                        Boolean(latest?.catatan && latest.catatan.includes('[Pelamar]: Telah mengonfirmasi'));
                                                                    const isDitunda = latest?.status_wawancara === 'Ditunda' ||
                                                                        Boolean(latest?.catatan && latest.catatan.includes('[Pengajuan Jadwal Ulang'));
                                                                    if (isConfirmed) {
                                                                        return <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded w-fit">✓ Terkonfirmasi</span>;
                                                                    }
                                                                    if (isDitunda) {
                                                                        return <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded w-fit">⚠️ Reschedule</span>;
                                                                    }
                                                                    return null;
                                                                })()}
                                                            </div>
                                                        ) : col.key ===
                                                          "Penawaran" ? (
                                                            <span className="hrd-kcard-meta">
                                                                {item
                                                                    .penawaran?.[0]
                                                                    ?.status_penawaran ??
                                                                    "Offered"}
                                                            </span>
                                                        ) : isFinal &&
                                                          finalInfo ? (
                                                            <span
                                                                className={`hrd-status-badge ${finalInfo.cls}`}
                                                            >
                                                                {
                                                                    finalInfo.label
                                                                }
                                                            </span>
                                                        ) : (
                                                            <span className="hrd-kcard-meta">
                                                                {item.lowongan
                                                                    ?.tipe_pekerjaan ??
                                                                    ""}{" "}
                                                                Applicants
                                                            </span>
                                                        )}

                                                        <Link
                                                            href={getReviewRoute(
                                                                item,
                                                            )}
                                                            className="hrd-kcard-review-link"
                                                        >
                                                            Click to Review →
                                                        </Link>
                                                    </div>

                                                    {getActionButton(
                                                        item,
                                                        col.key,
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ══ SCHEDULE INTERVIEW MODAL ══ */}
            <PelamarModal
                isOpen={!!scheduleModal}
                onClose={closeModal}
                title={
                    candidateName
                        ? `Schedule Interview - ${candidateName}`
                        : "Schedule Interview"
                }
                maxWidth="max-w-md"
            >
                <form onSubmit={submitSchedule} className="space-y-4 pt-2">
                    {/* Date & Time */}
                    <div>
                        <label className="form-label-base">
                            Date &amp; Time
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                id="schedule-datetime"
                                type="datetime-local"
                                className="form-input-base flex-1"
                                value={data.tanggal_wawancara}
                                onChange={(e) =>
                                    setData("tanggal_wawancara", e.target.value)
                                }
                                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const el = document.getElementById("schedule-datetime");
                                    if (el) el.blur();
                                }}
                                className="px-3.5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-gray-800 transition cursor-pointer"
                                title="Konfirmasi Pilihan Tanggal & Waktu"
                            >
                                OK
                            </button>
                        </div>
                        {errors.tanggal_wawancara && (
                            <span className="form-error-base">
                                {errors.tanggal_wawancara}
                            </span>
                        )}
                    </div>

                    {/* Format + Interviewer */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="form-label-base">Format</label>
                            <select
                                id="schedule-format"
                                className="form-select-base"
                                value={data.format_wawancara}
                                onChange={(e) =>
                                    setData("format_wawancara", e.target.value)
                                }
                            >
                                <option value="Online">Online</option>
                                <option value="Offline">Offline</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label-base">
                                Interviewer
                            </label>
                            <input
                                id="schedule-interviewer"
                                type="text"
                                className="form-input-base"
                                value={data.interviewer}
                                placeholder="Nama interviewer"
                                onChange={(e) =>
                                    setData("interviewer", e.target.value)
                                }
                                required
                            />
                            {errors.interviewer && (
                                <span className="form-error-base">
                                    {errors.interviewer}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Location / Meeting Link */}
                    <div>
                        <label className="form-label-base">
                            {data.format_wawancara === "Online"
                                ? "Meeting Link"
                                : "Location"}
                        </label>
                        {data.format_wawancara === "Online" ? (
                            <input
                                id="schedule-link"
                                type="text"
                                className="form-input-base"
                                value={data.link_meeting}
                                placeholder="https://meet.google.com/..."
                                onChange={(e) =>
                                    setData("link_meeting", e.target.value)
                                }
                            />
                        ) : (
                            <input
                                id="schedule-lokasi"
                                type="text"
                                className="form-input-base"
                                value={data.lokasi}
                                placeholder="Alamat / gedung"
                                onChange={(e) =>
                                    setData("lokasi", e.target.value)
                                }
                            />
                        )}
                        {(errors.link_meeting || errors.lokasi) && (
                            <span className="form-error-base">
                                {errors.link_meeting ?? errors.lokasi}
                            </span>
                        )}
                    </div>

                    {/* Catatan (opsional) */}
                    <div>
                        <label className="form-label-base">
                            Catatan{" "}
                            <span className="text-gray-400 font-normal normal-case">
                                (opsional)
                            </span>
                        </label>
                        <textarea
                            id="schedule-catatan"
                            className="form-textarea-base"
                            value={data.catatan}
                            placeholder="Catatan tambahan..."
                            rows={2}
                            onChange={(e) => setData("catatan", e.target.value)}
                        />
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            id="confirm-schedule-btn"
                            disabled={processing}
                            className="btn-primary"
                        >
                            {processing ? (
                                <span className="flex items-center gap-2">
                                    <svg
                                        className="animate-spin w-4 h-4"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8H4z"
                                        />
                                    </svg>
                                    Menyimpan...
                                </span>
                            ) : (
                                "Confirm Schedule"
                            )}
                        </button>
                    </div>
                </form>
            </PelamarModal>

            {/* ══ REVERT STATUS MODAL (HRD 7) ══ */}
            <PelamarModal
                isOpen={!!revertModalItem}
                onClose={() => setRevertModalItem(null)}
                title={
                    revertModalItem
                        ? `Kembalikan Status - ${revertModalItem.pelamar?.nama_lengkap ?? "Kandidat"}`
                        : "Kembalikan Status"
                }
                maxWidth="max-w-md"
            >
                <div className="space-y-4 pt-2">
                    <p className="text-xs text-gray-600">
                        Status kandidat ini saat ini adalah <strong>{revertModalItem?.status_lamaran}</strong>. Pilih tahap proses rekrutmen tujuan untuk mengembalikan status kandidat:
                    </p>

                    <div>
                        <label className="form-label-base">Pilih Tahap Rekrutmen</label>
                        <select
                            value={revertTargetStatus}
                            onChange={(e) => setRevertTargetStatus(e.target.value)}
                            className="form-select-base"
                        >
                            <option value="Screening">Tahap Screening</option>
                            <option value="Wawancara">Tahap Wawancara</option>
                            <option value="Penawaran">Tahap Penawaran</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => setRevertModalItem(null)}
                            className="btn-secondary"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (revertModalItem) {
                                    router.post(
                                        route("hrd.kandidat.revert_status", revertModalItem.id_lamaran),
                                        { target_status: revertTargetStatus },
                                        {
                                            preserveScroll: true,
                                            onSuccess: () => setRevertModalItem(null),
                                        }
                                    );
                                }
                            }}
                            className="btn-primary"
                        >
                            Konfirmasi Kembalikan
                        </button>
                    </div>
                </div>
            </PelamarModal>
        </HRDLayout>
    );
}
