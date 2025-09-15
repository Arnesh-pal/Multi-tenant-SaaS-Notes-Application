import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    providers: [
        // Providers are defined in the main auth.ts, 
        // but we must add an empty array here to satisfy the type.
    ],
    callbacks: {
        // This authorized callback is the one used by the middleware
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isApiRoute = nextUrl.pathname.startsWith('/api');

            if (isApiRoute) {
                // All protected API routes require authentication
                return isLoggedIn;
            }

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }

            // Allow unauthenticated access to other pages (like /login)
            return true;
        },
    },
} satisfies NextAuthConfig;