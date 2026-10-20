import React from 'react';

/**
 * Reusable SectionHeader component with underline divider.
 * Matches Dashboard.jsx section header aesthetics.
 */
export default function SectionHeader({ title, meta, children, className = '' }) {
    return (
        <div className={`section-header-row ${className}`}>
            <h2 className="section-header-title">{title}</h2>
            {(meta || children) && (
                <span className="section-header-meta">
                    {meta ?? children}
                </span>
            )}
        </div>
    );
}
