import React from "react";

/**
 * Reusable StatusBadge component.
 * Maps status names to standard visual styling based on Dashboard.jsx.
 */
export default function StatusBadge({
    status,
    variant,
    className = "",
    children,
}) {
    const s = String(status || children || "").toLowerCase();

    let styleClass = "badge-status-outline";

    if (variant === "black" || variant === "solid") {
        styleClass = "badge-status-solid";
    } else if (variant === "outline") {
        styleClass = "badge-status-outline";
    } else if (variant === "success") {
        styleClass = "badge-status-success";
    } else if (variant === "danger") {
        styleClass = "badge-status-danger";
    } else if (variant === "pill") {
        styleClass = "badge-status-pill";
    } else if (s.includes("ditolak") || s.includes("reject")) {
        styleClass = "badge-status-danger";
    } else if (s.includes("pending") || s.includes("menunggu keputusan")) {
        styleClass = "badge-status-pill";
    } else if (
        s.includes("diterima") ||
        s.includes("hired") ||
        s.includes("lolos") ||
        s.includes("resmi")
    ) {
        styleClass = "badge-status-success";
    } else if (
        s.includes("penawaran") ||
        s.includes("offer") ||
        s.includes("wawancara") ||
        s.includes("interview")
    ) {
        styleClass = "badge-status-solid";
    } else if (s.includes("menunggu") || s.includes("aksi")) {
        styleClass = "badge-status-pill";
    } else if (s.includes("dokumen") || s.includes("screening")) {
        styleClass = "badge-status-outline";
    }

    return (
        <span className={`${styleClass} ${className}`}>
            {children ?? status}
        </span>
    );
}
