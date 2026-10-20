import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="profile-section-title">Delete Account</h2>
                <p className="profile-section-desc">
                    Once your account is deleted, all of its resources and data will be permanently
                    deleted. Before deleting your account, please download any data or information
                    that you wish to retain.
                </p>
            </header>

            <button onClick={confirmUserDeletion} className="btn-danger py-2.5 px-6">
                Delete Account
            </button>

            {/* Confirm Delete Modal */}
            {confirmingUserDeletion && (
                <div className="modal-backdrop-dark">
                    <div className="modal-card-base">
                        <div className="modal-header-line">
                            <h3 className="modal-header-title">Delete Account</h3>
                            <button onClick={closeModal} className="modal-header-close">✕</button>
                        </div>

                        <form onSubmit={deleteUser} className="flex flex-col gap-4">
                            <p className="text-sm text-gray-700 leading-relaxed">
                                Are you sure you want to delete your account? Once deleted, all
                                resources and data will be permanently removed. Please enter your
                                password to confirm.
                            </p>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="delete_password" className="form-label-base">
                                    Password
                                </label>
                                <input
                                    id="delete_password"
                                    type="password"
                                    ref={passwordInput}
                                    className="form-input-base"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Enter your password"
                                    autoFocus
                                />
                                {errors.password && (
                                    <InputError message={errors.password} className="mt-1" />
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="btn-secondary py-2.5 px-5"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="btn-danger py-2.5 px-5"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
