import Header from '@/Components/Header';
import Footer from '@/Components/Footer';

export default function AuthenticatedLayout({ header, children }) {
    return (
        <div className="page-wrapper">
            <Header />

            {header && (
                <header className="page-header-banner">
                    <div className="page-header-banner-inner">
                        {header}
                    </div>
                </header>
            )}

            <main className="page-main">{children}</main>
            
            <Footer />
        </div>
    );
}
