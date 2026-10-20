import React from 'react';
import { Link } from '@inertiajs/react';

export default function Footer() {
    return (
        <footer className="footer-container">
            <div className="footer-inner">
                <div className="footer-brand-box">
                    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10,85 L35,35 L60,85 Z" fill="#FF7200"/>
                        <path d="M40,15 L90,15 L65,65 Z" fill="#9A0036"/>
                        <path d="M30,30 L55,80 L75,40 L50,90 Z" fill="#FFFFFF"/>
                    </svg>
                    <div className="footer-meta-row">
                        <span>Cybers Blitz Nusantara</span>
                        <span className="footer-dot">●</span>
                        <span>2026</span>
                    </div>
                </div>
                <div>
                    <Link href="#" className="footer-link">
                        CONTACT US
                    </Link>
                </div>
            </div>
        </footer>
    );
}
