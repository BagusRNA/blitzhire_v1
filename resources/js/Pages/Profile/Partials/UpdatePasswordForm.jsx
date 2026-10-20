import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header className="mb-6">
                <h2 className="profile-section-title">Update Password</h2>
                <p className="profile-section-desc">
                    Ensure your account is using a long, random password to stay secure.
                </p>
            </header>

            <form onSubmit={updatePassword} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label htmlFor="current_password" className="form-label-base">
                        Current Password
                    </label>
                    <input
                        id="current_password"
                        ref={currentPasswordInput}
                        type="password"
                        className="form-input-base"
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        autoComplete="current-password"
                    />
                    {errors.current_password && (
                        <InputError message={errors.current_password} className="mt-1" />
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="password" className="form-label-base">New Password</label>
                    <input
                        id="password"
                        ref={passwordInput}
                        type="password"
                        className="form-input-base"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="new-password"
                    />
                    {errors.password && (
                        <InputError message={errors.password} className="mt-1" />
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="password_confirmation" className="form-label-base">
                        Confirm Password
                    </label>
                    <input
                        id="password_confirmation"
                        type="password"
                        className="form-input-base"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        autoComplete="new-password"
                    />
                    {errors.password_confirmation && (
                        <InputError message={errors.password_confirmation} className="mt-1" />
                    )}
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <button type="submit" disabled={processing} className="btn-primary py-2.5 px-6">
                        Save
                    </button>
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-xs font-medium text-green-600">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
