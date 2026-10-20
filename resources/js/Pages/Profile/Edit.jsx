import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="page-title">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="section-wrapper">
                <div className="section-inner">
                    <div className="space-y-6 max-w-7xl">
                        <div className="profile-section-card">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-xl"
                            />
                        </div>

                        <div className="profile-section-card">
                            <UpdatePasswordForm className="max-w-xl" />
                        </div>

                        <div className="profile-section-card">
                            <DeleteUserForm className="max-w-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
