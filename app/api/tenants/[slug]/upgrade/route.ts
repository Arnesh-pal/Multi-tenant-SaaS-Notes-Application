import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

interface RouteParams {
    params: { slug: string };
}

// POST /api/tenants/:slug/upgrade
// Upgrades a tenant's plan to PRO
export async function POST(request: Request, { params }: RouteParams) {
    const session = await auth();

    // 1. Check authentication
    if (!session?.user?.id || !session.user.tenantId || !session.user.role) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. REQUIREMENT 2b: Role-based access control
    if (session.user.role !== Role.ADMIN) {
        return NextResponse.json({ error: 'Forbidden: Only admins can upgrade.' }, { status: 403 });
    }

    // 3. Ensure admin is upgrading their OWN tenant
    if (session.user.tenantSlug !== params.slug) {
        return NextResponse.json({ error: 'Forbidden: You can only upgrade your own tenant.' }, { status: 403 });
    }

    // 4. Perform the upgrade
    try {
        await prisma.tenant.update({
            where: {
                id: session.user.tenantId,
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