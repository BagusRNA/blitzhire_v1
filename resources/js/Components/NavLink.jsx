import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`breeze-nav-link ${active ? 'breeze-nav-link-active' : 'breeze-nav-link-inactive'} ${className}`}
        >
            {children}
        </Link>
    );
}
