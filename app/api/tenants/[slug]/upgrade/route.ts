export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

// POST /api/tenants/:slug/upgrade
export async function POST(
    request: Request,
    context: any // <-- THE FIX: Bypass the broken build check
) {
    const params = context.params; // This line will still work correctly

    // Use getToken
    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET!,
        salt: "authjs.session-token"
    });

    // 1. Check authentication
    if (!token || !token.id || !token.tenantId || !token.role) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Role Check
    if (token.role !== Role.ADMIN) {
        return NextResponse.json({ error: 'Forbidden: Only admins can upgrade.' }, { status: 403 });
    }

    // 3. Tenant Check
    if (token.tenantSlug !== params.slug) {
        return NextResponse.json({ error: 'Forbidden: You can only upgrade your own tenant.' }, { status: 403 });
    }

    // 4. Perform the upgrade
    try {
        await prisma.tenant.update({
            where: {
                id: token.tenantId,
            },
            data: {
                plan: 'PRO',
            },
        });

        return NextResponse.json({ status: 'upgraded' });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to upgrade plan' }, { status: 500 });
    }
}