import React, { useEffect } from "react";
import { Head, Link } from "@inertiajs/react";

export default function LaporanPelamar({ laporan = [] }) {
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("format") === "print") {
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const todayStr = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white text-gray-900">
            <Head title="Laporan Data Pelamar - BlitzHire" />

            {/* Top Toolbar (Hidden on print) */}
            <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center print:hidden">
                <Link
                    href="/hrd/manajemen-data"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded shadow-xs text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 uppercase tracking-wider"
                >
                    ← Kembali ke Manajemen Data
                </Link>
                <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-xs uppercase tracking-wider"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
                    </svg>
                    Cetak / Simpan PDF
                </button>
            </div>

            {/* Printable Document Sheet */}
            <div className="max-w-6xl mx-auto bg-white p-8 sm:p-12 border border-gray-200 rounded shadow-xs print:shadow-none print:border-none print:p-0">
                {/* Letterhead */}
                <div className="border-b-2 border-gray-900 pb-4 mb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">BlitzHire</h1>
                        <p className="text-xs text-gray-600">Applicant Tracking & Recruitment System</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-sm font-bold uppercase text-gray-900">Laporan Data Pelamar</h2>
                        <p className="text-xs text-gray-500">Tanggal Cetak: {todayStr}</p>
                    </div>
                </div>

                {/* Meta details */}
                <div className="mb-4 text-xs text-gray-600 flex justify-between">
                    <span>Total Pelamar: <strong>{laporan.length} orang</strong></span>
                    <span>Status: <strong>Semua Tahapan</strong></span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100 border-b border-gray-300">
                                <th className="p-2 border border-gray-300 w-10 text-center">No</th>
                                <th className="p-2 border border-gray-300 font-bold">Nama Lengkap</th>
                                <th className="p-2 border border-gray-300 font-bold">Email</th>
                                <th className="p-2 border border-gray-300 font-bold">No. HP</th>
                                <th className="p-2 border border-gray-300 font-bold">Posisi Lowongan</th>
                                <th className="p-2 border border-gray-300 font-bold">Tipe</th>
                                <th className="p-2 border border-gray-300 font-bold">Tanggal Lamar</th>
                                <th className="p-2 border border-gray-300 font-bold text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {laporan.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-4 text-center text-gray-400">
                                        Tidak ada data pelamar.
                                    </td>
                                </tr>
                            ) : (
                                laporan.map((item, idx) => (
                                    <tr key={item.id_lamaran} className="hover:bg-gray-50">
                                        <td className="p-2 border border-gray-300 text-center font-mono">
                                            {idx + 1}
                                        </td>
                                        <td className="p-2 border border-gray-300 font-semibold">
                                            {item.pelamar?.nama_lengkap ?? "—"}
                                        </td>
                                        <td className="p-2 border border-gray-300 text-gray-600">
                                            {item.pelamar?.email ?? "—"}
                                        </td>
                                        <td className="p-2 border border-gray-300 text-gray-600">
                                            {item.pelamar?.nomor_hp ?? item.pelamar?.no_telepon ?? "—"}
                                        </td>
                                        <td className="p-2 border border-gray-300">
                                            {item.lowongan?.judul_lowongan ?? item.lowongan?.posisi ?? "—"}
                                        </td>
                                        <td className="p-2 border border-gray-300 text-gray-600">
                                            {item.lowongan?.tipe_pekerjaan ?? "—"}
                                        </td>
                                        <td className="p-2 border border-gray-300 text-gray-600 whitespace-nowrap">
                                            {item.tanggal_lamaran
                                                ? new Date(item.tanggal_lamaran).toLocaleDateString("id-ID")
                                                : "—"}
                                        </td>
                                        <td className="p-2 border border-gray-300 text-center font-bold">
                                            <span className="px-2 py-0.5 rounded text-[10px] uppercase bg-gray-100 text-gray-800">
                                                {item.status_lamaran}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Sign-off section */}
                <div className="mt-12 pt-6 flex justify-between text-xs text-gray-700 break-inside-avoid">
                    <div>
                        <p className="text-gray-500">Dicetak melalui sistem BlitzHire</p>
                    </div>
                    <div className="text-center w-48">
                        <p>Mengetahui,</p>
                        <p className="font-bold mt-1">Tim HRD / Recruitment</p>
                        <div className="h-16"></div>
                        <p className="border-b border-gray-400 font-bold uppercase">( ........................................ )</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

