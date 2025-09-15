'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email: email,
                password: password,
            });

            if (result?.error) {
                setError('Invalid email or password. Please use a test account.');
                console.error(result.error);
            } else if (result?.ok) {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error(error);
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Updated Logo Path */}
                <img
                    className="mx-auto h-10 w-auto"
                    src="/app-logo.png"
                    alt="App Logo"
                />
                <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-gray-900">
                    Sign in to your account
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="rounded-lg bg-white px-4 py-8 shadow-lg sm:px-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@acme.test"
                                    required
                                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-gray-900"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="password"
                                    required
                                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-gray-900"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>

                    {/* Test Accounts Info */}
                    <div className="mt-6 border-t border-gray-200 pt-6">
                        <div className="rounded-md bg-slate-50 p-4">
                            <h3 className="text-sm font-semibold text-slate-800">Test Accounts</h3>
                            <p className="text-sm text-slate-600">Use password: `password`</p>
                            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-700">
                                <li>admin@acme.test (Admin, Acme)</li>
                                <li>user@acme.test (Member, Acme)</li>
                                <li>admin@globex.test (Admin, Globex)</li>
                                <li>user@globex.test (Member, Globex)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}