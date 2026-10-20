import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="page-title">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="section-wrapper">
                <div className="section-inner">
                    <div className="content-card">
                        <div className="content-card-body">
                            You're logged in!
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
