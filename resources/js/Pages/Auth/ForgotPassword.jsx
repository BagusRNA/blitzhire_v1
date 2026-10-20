import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm, Link } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <div className="auth-standalone-page">
            <Head title="Forgot Password - BlitzHire" />
            
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <Link href="/" className="text-3xl font-black text-black tracking-tight uppercase">BlitzHire</Link>
                <h2 className="mt-4 text-xl font-bold text-black uppercase tracking-tight">Reset your password</h2>
                <p className="mt-2 text-xs text-gray-500 mb-6">
                    Forgot your password? No problem. Just let us know your email address and we will email you a password reset link.
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="auth-standalone-card">
                    
                    {status && <div className="mb-4 font-bold text-xs text-black bg-gray-100 border border-gray-800 p-3 rounded">{status}</div>}

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="form-label-base">Email address</label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="auth-standalone-input"
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </div>
                            <InputError message={errors.email} className="mt-1" />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="auth-standalone-btn"
                            >
                                {processing ? 'Sending...' : 'Email Password Reset Link'}
                            </button>
                        </div>
                        
                        <div className="text-center mt-4">
                            <Link href="/login" className="text-xs font-bold text-black hover:underline uppercase tracking-wider">
                                Back to login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
