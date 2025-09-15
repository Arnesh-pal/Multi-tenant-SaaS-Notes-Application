import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from './lib/prisma';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials.email || !credentials.password) {
                    return null;
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                // 1. Find user by email, AND include their tenant info
                const user = await prisma.user.findUnique({
                    where: { email },
                    include: { tenant: true }, // Include the related tenant
                });

                if (!user || !user.tenant) {
                    console.log('No user found');
                    return null;
                }

                // 2. Check password hash
                const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

                if (!passwordsMatch) {
                    console.log('Passwords do not match');
                    return null;
                }

                // 3. Return the full user object to be used in the JWT callback
                // We include all the custom data we need in the session
                return {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    tenantId: user.tenantId,
                    tenantSlug: user.tenant.slug,
                    tenantPlan: user.tenant.plan,
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt', // We must use JWT for credential provider
    },
    callbacks: {
        // This callback adds our custom data to the JWT token itself
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                // @ts-ignore
                token.role = user.role;
                // @ts-ignore
                token.tenantId = user.tenantId;
                // @ts-ignore
                token.tenantSlug = user.tenantSlug;
                // @ts-ignore
                token.tenantPlan = user.tenantPlan;
            }
            return token;
        },

        // This callback adds the data from the token into the server-side session
        // object, which is what we'll access in API routes and Server Components
        async session({ session, token }) {
            if (token && session.user) {
                // @ts-ignore
                session.user.id = token.id;
                // @ts-ignore
                session.user.role = token.role;
                // @ts-ignore
                session.user.tenantId = token.tenantId;
                // @ts-ignore
                session.user.tenantSlug = token.tenantSlug;
                // @ts-ignore
                session.user.plan = token.tenantPlan;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login', // Redirect users to /login if they are not authenticated
    },
});