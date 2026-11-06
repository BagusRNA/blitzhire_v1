import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import HRDLayout from '@/Layouts/HRDLayout';

export default function KonfigurasiPenilaian({
    thresholds: initialThresholds = [],
    categories: initialCategories = [],
    errors = {},
    flash = {},
}) {
    const defaultThresholds = [
        { label: 'Skor Minimum Lanjut Screening', key: 'min_screening', value: '60%' },
        { label: 'Skor Auto-Reject', key: 'auto_reject', value: '40%' },
        { label: 'Skor Minimum tanpa Screening', key: 'auto_pass', value: '85%' },
    ];

    const defaultCategories = [
        { name: 'Pendidikan', weight: '20%', chips: ['S1', 'S2', 'Teknik', 'Informatika'] },
        { name: 'Pengalaman Kerja', weight: '35%', chips: ['3 tahun pengalaman', 'Internship', 'Full-Stack', 'UI/UX'] },
        { name: 'Technical Skills', weight: '30%', chips: ['Figma', 'React', 'Laravel', 'PHP', 'Tailwind', 'SQL'] },
        { name: 'Soft Skills', weight: '15%', chips: ['Komunikasi', 'Teamwork', 'Problem Solving', 'Leadership'] },
    ];

    const [thresholds, setThresholds] = useState(
        initialThresholds.length ? initialThresholds : defaultThresholds
    );
    const [categories, setCategories] = useState(
        initialCategories.length ? initialCategories : defaultCategories
    );

    const [newKeywordInputs, setNewKeywordInputs] = useState({});
    const [savedMessage, setSavedMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    // IR18 / TC67: Menambahkan keyword baru dengan validasi duplikasi
    const handleAddChip = (catIndex) => {
        const text = (newKeywordInputs[catIndex] || '').trim();
        if (!text) {
            setErrorMessage('Tidak boleh kosong!');
            alert('Tidak boleh kosong!');
            return;
        }

        const cat = categories[catIndex];
        const isDuplicate = cat.chips.some(
            (c) => c.toLowerCase() === text.toLowerCase()
        );

        if (isDuplicate) {
            setErrorMessage('Kategori sudah ada!');
            alert('Kategori sudah ada!');
            return;
        }

        const updated = [...categories];
        updated[catIndex].chips = [...updated[catIndex].chips, text];
        setCategories(updated);
        setNewKeywordInputs({ ...newKeywordInputs, [catIndex]: '' });
        setErrorMessage(null);
    };

    const handleRemoveChip = (catIndex, chipToRemove) => {
        const updated = [...categories];
        updated[catIndex].chips = updated[catIndex].chips.filter(
            (c) => c !== chipToRemove
        );
        setCategories(updated);
    };

    // IR16, IR17, IR19, IR20: Validasi saat menyimpan konfigurasi
    const handleSave = () => {
        setErrorMessage(null);

        // 1. Validasi Batas Skor Otomatis (IR16 & IR17 / TC64 & TC65)
        for (const item of thresholds) {
            const cleanStr = String(item.value ?? '').trim().replace('%', '');
            if (cleanStr === '') {
                setErrorMessage('Tidak boleh kosong!');
                alert('Tidak boleh kosong!');
                return;
            }

            const val = Number(cleanStr);
            if (isNaN(val) || val < 0 || val > 100) {
                setErrorMessage('Nilai tidak valid!');
                alert('Nilai tidak valid!');
                return;
            }
        }

        // 2. Validasi Kategori & Bobot Penilaian (IR19 & IR20 / TC69 & TC70)
        let totalWeight = 0;
        for (const cat of categories) {
            const cleanStr = String(cat.weight ?? '').trim().replace('%', '');
            if (cleanStr === '') {
                setErrorMessage('Tidak boleh kosong!');
                alert('Tidak boleh kosong!');
                return;
            }

            const w = Number(cleanStr);
            if (isNaN(w) || w < 0 || w > 100) {
                setErrorMessage('Konfigurasi tidak valid!');
                alert('Konfigurasi tidak valid!');
                return;
            }
            totalWeight += w;
        }

        if (Math.round(totalWeight) !== 100) {
            setErrorMessage('Konfigurasi tidak valid!');
            alert('Konfigurasi tidak valid!');
            return;
        }

        // Kirim ke server
        router.post(
            route('hrd.konfigurasi-penilaian.store'),
            { thresholds, categories },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setErrorMessage(null);
                    setSavedMessage(true);
                    setTimeout(() => setSavedMessage(false), 3000);
                },
                onError: (err) => {
                    const firstError = Object.values(err)[0];
                    if (firstError) {
                        setErrorMessage(firstError);
                        alert(firstError);
                    }
                },
            }
        );
    };

    return (
        <HRDLayout title="Konfigurasi Penilaian">
            <div className="hrd-config-page">
                {/* ── Page Header with Line ── */}
                <div className="hrd-page-inline-wrap">
                    <h1 className="hrd-page-inline-title">Konfigurasi Penilaian</h1>
                    <div className="hrd-page-inline-line"></div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-xs font-bold rounded flex items-center justify-between">
                        <span>⚠️ {errorMessage}</span>
                        <button
                            type="button"
                            onClick={() => setErrorMessage(null)}
                            className="text-red-700 hover:text-red-900"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Server Error from props */}
                {errors && Object.keys(errors).length > 0 && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-xs font-bold rounded">
                        {Object.values(errors).map((err, i) => (
                            <div key={i}>⚠️ {err}</div>
                        ))}
                    </div>
                )}

                {/* Success Banner */}
                {(savedMessage || flash?.success) && (
                    <div className="hrd-flash-success flex items-center justify-between mb-4">
                        <span>Konfigurasi penilaian berhasil disimpan.</span>
                    </div>
                )}

                {/* ── Section 1: Batas Skor Otomatis ── */}
                <div className="hrd-config-section">
                    <div className="hrd-config-header">
                        <h2 className="hrd-config-title">Batas Skor Otomatis</h2>
                    </div>

                    <div className="flex flex-col">
                        {thresholds.map((item, idx) => (
                            <div key={item.key || idx} className="hrd-config-row">
                                <span className="hrd-config-label">{item.label}</span>
                                <div className="hrd-config-swatch">
                                    {/* IR15: Extraneous swatch square removed */}
                                    <input
                                        type="text"
                                        value={item.value}
                                        onChange={(e) => {
                                            const updated = [...thresholds];
                                            updated[idx].value = e.target.value;
                                            setThresholds(updated);
                                        }}
                                        placeholder="0%"
                                        className="hrd-config-value w-24 text-right bg-transparent border-b border-gray-400 focus:outline-none focus:border-black font-semibold"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Section 2: Kategori & Bobot Penilaian ── */}
                <div className="hrd-config-section">
                    <div className="hrd-config-header">
                        <h2 className="hrd-config-title">Kategori & Bobot Penilaian</h2>
                    </div>

                    <div className="flex flex-col">
                        {categories.map((cat, idx) => (
                            <div key={cat.name} className="hrd-config-row items-start">
                                <div className="hrd-config-input-wrap flex-1">
                                    <span className="hrd-config-label">{cat.name}</span>
                                    <div className="hrd-config-pill-row mt-2 flex flex-wrap gap-1.5 items-center">
                                        {cat.chips.map((chip) => (
                                            <span
                                                key={chip}
                                                className="hrd-config-chip inline-flex items-center gap-1.5"
                                            >
                                                {chip}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveChip(idx, chip)
                                                    }
                                                    className="text-gray-400 hover:text-black font-bold text-xs"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}

                                        {/* Add keyword input */}
                                        <div className="inline-flex items-center gap-1">
                                            <input
                                                type="text"
                                                value={newKeywordInputs[idx] || ''}
                                                onChange={(e) =>
                                                    setNewKeywordInputs({
                                                        ...newKeywordInputs,
                                                        [idx]: e.target.value,
                                                    })
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddChip(idx);
                                                    }
                                                }}
                                                placeholder="+ Kata Kunci"
                                                className="border border-gray-300 rounded px-2 py-1 text-xs w-28 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleAddChip(idx)}
                                                className="hrd-config-add-btn text-xs py-1 px-2.5 rounded bg-black text-white hover:bg-gray-800"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="hrd-config-swatch ml-4 pt-1">
                                    <input
                                        type="text"
                                        value={cat.weight}
                                        onChange={(e) => {
                                            const updated = [...categories];
                                            updated[idx].weight = e.target.value;
                                            setCategories(updated);
                                        }}
                                        placeholder="0%"
                                        className="hrd-config-value w-20 text-right bg-transparent border-b border-gray-400 focus:outline-none focus:border-black font-semibold"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Save button */}
                <div className="flex justify-end pt-3">
                    <button
                        type="button"
                        onClick={handleSave}
                        className="btn-primary py-2.5 px-6 text-xs tracking-wider"
                    >
                        SIMPAN KONFIGURASI
                    </button>
                </div>
            </div>
        </HRDLayout>
    );
}
