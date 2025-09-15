import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <main className="mx-auto max-w-2xl">
        {/* Updated Logo Path */}
        <img
          className="mx-auto h-16 w-auto"
          src="/app-logo.png"
          alt="App Logo"
        />

        {/* Headline */}
        <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Welcome to the Multi-Tenant Notes App
        </h1>

        {/* Description */}
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
          A secure, collaborative, and isolated note-taking application designed for your entire team.
        </p>

        {/* Call-to-Action Button */}
        <div className="mt-10">
          <Link
            href="/login"
            className="flex-shrink-0 rounded-md bg-indigo-600 px-8 py-3 text-base font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Login to Get Started
          </Link>
        </div>
      </main>
    </div>
  );
}