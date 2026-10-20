import React from 'react';

/**
 * Reusable InfoCard component for label & value pairs.
 * Styled based on Dashboard.jsx source of truth design system.
 */
export default function InfoCard({ label, value, children, className = '', labelClassName = '', valueClassName = '' }) {
    return (
        <div className={`info-card ${className}`}>
            {label && <div className={`info-card-label ${labelClassName}`}>{label}</div>}
            <div className={`info-card-value ${valueClassName}`}>
                {value ?? children}
            </div>
        </div>
    );
}
