export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

// Set the cookie name based on the environment
const cookieName = process.env.NODE_ENV === 'production'
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token';

// POST /api/tenants/:slug/upgrade
export async function POST(
    request: Request,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: any
) {
    const params = context.params;

    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET!,
        salt: cookieName // <-- Use the dynamic variable
    });

    // ... (rest of function is the same)
    if (!token || !token.id || !token.tenantId || !token.role) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (token.role !== Role.ADMIN) {
        return NextResponse.json({ error: 'Forbidden: Only admins can upgrade.' }, { status: 403 });
    }
    if (token.tenantSlug !== params.slug) {
        return NextResponse.json({ error: 'Forbidden: You can only upgrade your own tenant.' }, { status: 403 });
    }

    try {
        await prisma.tenant.update({
            where: { id: token.tenantId },
            data: { plan: 'PRO' },
        });
        return NextResponse.json({ status: 'upgraded' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to upgrade plan' }, { status: 500 });
    }
}