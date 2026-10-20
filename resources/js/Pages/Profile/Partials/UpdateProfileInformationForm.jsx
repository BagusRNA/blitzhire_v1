import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header className="mb-6">
                <h2 className="profile-section-title">Profile Information</h2>
                <p className="profile-section-desc">
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label htmlFor="name" className="form-label-base">Name</label>
                    <input
                        id="name"
                        type="text"
                        className="form-input-base"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
                    />
                    {errors.name && <InputError message={errors.name} className="mt-1" />}
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="email" className="form-label-base">Email</label>
                    <input
                        id="email"
                        type="email"
                        className="form-input-base"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    {errors.email && <InputError message={errors.email} className="mt-1" />}
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="text-sm text-gray-700">
                            Your email address is unverified.{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="text-black font-bold hover:underline text-xs"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-xs font-medium text-green-600">
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}

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
