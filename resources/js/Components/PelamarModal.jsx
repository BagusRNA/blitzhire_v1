import React from 'react';

/**
 * Reusable Modal dialog component.
 * Uses clean styling from Dashboard.jsx.
 */
export default function PelamarModal({
    isOpen = false,
    onClose,
    title,
    maxWidth = 'max-w-md',
    children,
}) {
    if (!isOpen) return null;

    return (
        <div
            className="modal-backdrop-dark"
            onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
            <div className={`modal-card-base ${maxWidth}`}>
                {/* Header */}
                <div className="modal-header-line">
                    <h3 className="modal-header-title">
                        {title}
                    </h3>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="modal-header-close"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Content */}
                <div>
                    {children}
                </div>
            </div>
        </div>
    );
}
