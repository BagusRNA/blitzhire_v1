import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";

export default function JobBoard({ jobs, filterOptions = [], filters = {} }) {
    const normalizeType = (t) => {
        if (!t) return "Semua";
        if (
            ["magang", "pkl", "magang / pkl", "internship", "internship/pkl"].includes(
                t.toLowerCase()
            )
        ) {
            return "Internship/PKL";
        }
        return t;
    };

    const [search, setSearch] = useState(filters.search ?? "");
    const [selectedType, setSelectedType] = useState(normalizeType(filters.type));

    const defaultTypes = ["Semua", "Full-Time", "Internship/PKL"];
    const incomingTypes = (filterOptions || []).filter(
        (type) =>
            type &&
            type !== "Semua" &&
            type !== "Full-Time" &&
            type !== "Internship/PKL"
    );
    const typeOptions = Array.from(new Set([...defaultTypes, ...incomingTypes]));

    const applyFilter = (nextSearch = search, nextType = selectedType) => {
        const params = {};

        if (nextSearch.trim()) {
            params.search = nextSearch.trim();
        }

        if (nextType && nextType !== "Semua") {
            params.type = nextType;
        }

        router.get(route("jobs.index"), params, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        applyFilter();
    };

    const handleTypeChange = (type) => {
        setSelectedType(type);
        applyFilter(search, type);
    };

    return (
        <div className="jobs-page-wrapper">
            <Head title="Forum Job - BlitzHire" />

            <Header />

            <main className="jobs-main">
                <div className="jobs-header">
                    <h2 className="jobs-title">
                        Discover Your Next Role
                    </h2>
                    <p className="jobs-subtitle">
                        Browse open positions and find where you belong.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="jobs-search-form">
                    <div className="jobs-search-bar">
                        <input
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Cari judul, skill, dll..."
                            className="jobs-search-input"
                        />

                        <select
                            value={selectedType}
                            onChange={(event) =>
                                handleTypeChange(event.target.value)
                            }
                            className="jobs-select"
                        >
                            {typeOptions.map((type) => (
                                <option key={type} value={type}>
                                    {type === "Semua" ? "Type" : type}
                                </option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            className="jobs-search-btn"
                        >
                            CARI
                        </button>
                    </div>

                    <div className="jobs-filter-chips">
                        {typeOptions.map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => handleTypeChange(type)}
                                className={`jobs-filter-chip ${
                                    selectedType === type
                                        ? "jobs-filter-chip--active"
                                        : ""
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </form>

                <div className="jobs-list-container">
                    {jobs?.length > 0 ? (
                        jobs.map((job) => (
                            <div
                                key={job.id_lowongan}
                                className="jobs-card"
                            >
                                <div className="jobs-card-info">
                                    <div className="jobs-initial-box">
                                        {(job.judul_lowongan || job.posisi)?.charAt(0)?.toUpperCase() ||
                                            "J"}
                                    </div>

                                    <div className="jobs-card-body">
                                        <div className="jobs-card-title-row">
                                            <h3 className="jobs-card-title">
                                                {job.judul_lowongan || job.posisi}
                                            </h3>
                                            <span className="jobs-type-badge">
                                                {job.tipe_pekerjaan}
                                            </span>
                                        </div>
                                        <div className="jobs-card-meta">
                                            {job.departemen && <span>▪ {job.departemen}</span>}
                                            <span>▪ {job.lokasi}</span>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href={route("jobs.show", job.id_lowongan)}
                                    className="jobs-detail-btn"
                                >
                                    LIHAT DETAIL
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="jobs-empty">
                            Tidak ada lowongan yang cocok dengan pencarian atau
                            filter yang dipilih.
                        </div>
                    )}
                </div>
            </main>
            
            <Footer />
        </div>
    );
}
