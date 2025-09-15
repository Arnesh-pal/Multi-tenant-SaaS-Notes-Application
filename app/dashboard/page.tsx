'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// --- SVG Icons ---
const LightningBoltIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
);
const WarningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
    </svg>
);
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.54 0c-.27.041-.54.082-.811.124m12.54 0a48.734 48.734 0 01-3.478-.397m-9.065 0c.27.041.54.082.811.124M3.86 5.215c.045.022.09.044.135.066m6.31 0c.27.041.54.082.811.124m0 0c.27.041.54.082.811.124M9.76 5.215c.045.022.09.044.135.066m6.31 0c.27.041.54.082.811.124m0 0c.27.041.54.082.811.124" />
    </svg>
);

interface Note {
    id: string;
    content: string;
    createdAt: string;
}

export default function Dashboard() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const user = session?.user;

    // --- Data Fetching ---
    const fetchNotes = async () => {
        try {
            const res = await fetch('/api/notes', { credentials: 'include' }); // This one was already fixed
            if (!res.ok) {
                if (res.status === 401) {
                    setError('Authentication failed. Please log in again.');
                } else {
                    throw new Error('Failed to fetch');
                }
            } else {
                const data: Note[] = await res.json();
                setNotes(data);
            }
        } catch (e) {
            setError('Failed to load notes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'loading') return;
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }
        if (status === 'authenticated') {
            fetchNotes();
        }
    }, [status, router]);

    // --- Event Handlers ---
    const handleSignOut = async () => {
        await signOut({ redirect: true, callbackUrl: '/login' });
    };

    const handleCreateNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;
        setError('');

        try {
            const res = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // <-- 1. THIS WAS THE MISSING FIX
                body: JSON.stringify({ content: newNote }),
            });

            if (res.status === 403) {
                const data = await res.json();
                if (data.code === 'ERR_LIMIT_REACHED') {
                    setError('You have reached the 3-note limit. Please upgrade to Pro.');
                } else {
                    setError(data.error || 'You are not authorized to create a note.');
                }
                return;
            }

            if (!res.ok) {
                if (res.status === 401) {
                    setError('Authentication failed. Please log in again.');
                } else {
                    throw new Error('Failed to create note');
                }
                return;
            }

            setNewNote('');
            fetchNotes();
        } catch (e) {
            setError('Failed to create note.');
        }
    };

    const handleDeleteNote = async (id: string) => {
        if (!confirm('Are you sure you want to delete this note?')) return;
        try {
            const res = await fetch(`/api/notes/${id}`, {
                method: 'DELETE',
                credentials: 'include', // <-- 2. THIS WAS THE MISSING FIX
            });
            if (!res.ok) throw new Error('Failed to delete');
            fetchNotes();
        } catch (e) {
            setError('Failed to delete note.');
        }
    };

    const handleUpgrade = async () => {
        if (!user || user.role !== 'ADMIN') return;
        if (!confirm('Are you sure you want to upgrade to the Pro plan?')) return;

        try {
            const res = await fetch(`/api/tenants/${user.tenantSlug}/upgrade`, {
                method: 'POST',
                credentials: 'include', // <-- 3. THIS WAS THE MISSING FIX
            });

            if (!res.ok) {
                throw new Error('Failed to upgrade');
            }

            alert('Upgrade successful! Your plan is now PRO.');
            location.reload();
        } catch (e) {
            setError('Failed to upgrade. Please try again.');
        }
    };

    // --- Render Logic ---
    if (status === 'loading' || loading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                Loading dashboard...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="mx-auto max-w-4xl">

                {/* Header Card */}
                <header className="mb-8 flex items-center justify-between rounded-lg bg-white p-5 shadow-md">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Dashboard</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Welcome, <span className="font-medium text-gray-900">{user.email}</span> ({user.role})
                        </p>
                        <p className="mt-2 text-sm text-gray-600">
                            Tenant: <span className="font-medium text-gray-900">{user.tenantSlug}</span> | Plan:{' '}
                            <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.plan === 'PRO'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-indigo-100 text-indigo-800'
                                    }`}
                            >
                                {user.plan}
                            </span>
                        </p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                        Sign Out
                    </button>
                </header>

                {/* Upgrade Banner (Admin Only) */}
                {user.role === 'ADMIN' && user.plan === 'FREE' && (
                    <div className="mb-8 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shadow-lg">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <LightningBoltIcon />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-semibold">Your team is on the Free plan.</h3>
                                    <p className="text-sm opacity-90">Upgrade to Pro for unlimited notes.</p>
                                </div>
                            </div>
                            <button
                                onClick={handleUpgrade}
                                className="flex-shrink-0 rounded-md bg-white px-5 py-2 font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
                            >
                                Upgrade to Pro
                            </button>
                        </div>
                    </div>
                )}

                {/* Create Note Form Card */}
                <form onSubmit={handleCreateNote} className="mb-8 rounded-lg bg-white p-6 shadow-md">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900">Create New Note</h2>
                    <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="block w-full rounded-md border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        rows={3}
                        placeholder="Write your note here..."
                    />

                    {/* Form-specific error message */}
                    {error && (
                        <div className="mt-4 rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <WarningIcon />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="mt-4 rounded-md border border-transparent bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Save Note
                    </button>
                </form>

                {/* Notes List Section */}
                <section>
                    <h2 className="mb-4 text-xl font-semibold text-gray-900">Your Notes</h2>
                    <div className="space-y-4">
                        {notes.length === 0 && !loading && (
                            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
                                <h3 className="text-lg font-medium text-gray-900">No notes yet!</h3>
                                <p className="mt-1 text-sm text-gray-500">Create your first note above to get started.</p>
                            </div>
                        )}
                        {notes.map((note) => (
                            <div
                                key={note.id}
                                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                            >
                                <div>
                                    <p className="text-base text-gray-800">{note.content}</p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Created on: {new Date(note.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDeleteNote(note.id)}
                                    className="rounded-full p-2 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600"
                                    aria-label="Delete note"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}