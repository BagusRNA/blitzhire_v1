import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';

export default function Header() {
    const { props, url } = usePage();
    const { auth } = props;
    const user = auth?.user;
    const isHRD = user && user.id_hrd !== undefined;
    const isPelamar = user && user.id_pelamar !== undefined;
    
    const dashboardRoute = isHRD ? "/hrd/dashboard" : "/pelamar/dashboard";
    const logoutRoute = isHRD ? "/hrd-login/logout" : "/kandidat/logout";
    
    return (
        <header className="header-container">
            <div className="header-inner">
                <div className="header-row">
                    <Link href="/" className="header-brand-link">
                        <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10,85 L35,35 L60,85 Z" fill="#FF7200"/>
                            <path d="M40,15 L90,15 L65,65 Z" fill="#9A0036"/>
                            <path d="M30,30 L55,80 L75,40 L50,90 Z" fill="#1C2434"/>
                        </svg>
                        <div className="brand-text">
                            <div>Cybers Blitz</div>
                            <div>Nusantara</div>
                        </div>
                    </Link>
                    
                    <nav className="header-nav">
                        <Link href="/" className={`nav-link ${url === '/' ? 'nav-link-active' : 'nav-link-inactive'}`}>
                            Home
                        </Link>
                        <Link href="/jobs" className={`nav-link ${url.startsWith('/jobs') ? 'nav-link-active' : 'nav-link-inactive'}`}>
                            Explore Jobs
                        </Link>
                        
                        {!user ? (
                            <Link href="/login" className="btn-primary">
                                Sign In/Register
                            </Link>
                        ) : (
                            <div className="header-dropdown-wrap">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="header-user-btn"
                                            >
                                                <div className="header-user-avatar-placeholder"></div>
                                                <span>
                                                    {isHRD ? 'Admin/HRD' : 'Pelamar'}
                                                </span>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={dashboardRoute}>
                                            Dashboard
                                        </Dropdown.Link>
                                        <Dropdown.Link href="#">
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={logoutRoute}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
