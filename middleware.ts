import NextAuth from 'next-auth';
import { authConfig } from './auth.config'; // We will create this next

export default NextAuth(authConfig).auth;

export const config = {
    // Match all routes EXCEPT:
    // - /api/auth/... (NextAuth internal routes)
    // - /api/health (our public health check)
    // - _next/static, _next/image, favicon.ico (static assets)
    // - / (the homepage, which we'll leave public)
    // - /login (the login page)
    matcher: [
        '/((?!api/auth/.*|api/health|_next/static|_next/image|favicon.ico|login|$).*)',
    ],
};