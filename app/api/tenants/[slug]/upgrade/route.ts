export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth'; // <-- Use auth, not getToken
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

// 🛑 Removed cookieName and getToken imports

// POST /api/tenants/:slug/upgrade
export async function POST(
    request: Request,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: any
) {
    const params = context.params;
    const session = await auth(); // <-- Reverted to auth()

    // 1. Check authentication
    if (!session?.user?.id || !session?.user?.tenantId || !session?.user?.role) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Role Check
    if (session.user.role !== Role.ADMIN) {
        return NextResponse.json({ error: 'Forbidden: Only admins can upgrade.' }, { status: 403 });
    }

    // 3. Tenant Check
    if (session.user.tenantSlug !== params.slug) {
        return NextResponse.json({ error: 'Forbidden: You can only upgrade your own tenant.' }, { status: 403 });
    }

    // 4. Perform the upgrade
    try {
        await prisma.tenant.update({
            where: { id: session.user.tenantId },
            data: { plan: 'PRO' },
        });
        return NextResponse.json({ status: 'upgraded' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to upgrade plan' }, { status: 500 });
    }
}