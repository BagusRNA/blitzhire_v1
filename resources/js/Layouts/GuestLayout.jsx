import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="page-wrapper">
            <Header />
            <main className="guest-main">
                <div>
                    <Link href="/">
                        <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                    </Link>
                </div>

                <div className="guest-card">
                    {children}
                </div>
            </main>
            <Footer />
        </div>
    );
}
