export const dynamic = 'force-dynamic'; // Add force-dynamic
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt'; // Use getToken
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

// 🛑 The 'interface RouteParams' has been DELETED

// POST /api/tenants/:slug/upgrade
// This function signature is now fixed
export async function POST(
    request: Request,
    { params }: { params: { slug: string } } // <-- 1. TYPE FIX
) {
    // Use getToken instead of auth()
    const token = await getToken({ // <-- 2. AUTH FIX
        req: request,
        secret: process.env.AUTH_SECRET!,
        salt: "authjs.session-token"
    });

    // 1. Check authentication (using the token)
    if (!token || !token.id || !token.tenantId || !token.role) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. REQUIREMENT 2b: Role-based access control
    if (token.role !== Role.ADMIN) {
        return NextResponse.json({ error: 'Forbidden: Only admins can upgrade.' }, { status: 403 });
    }

    // 3. Ensure admin is upgrading their OWN tenant
    if (token.tenantSlug !== params.slug) {
        return NextResponse.json({ error: 'Forbidden: You can only upgrade your own tenant.' }, { status: 403 });
    }

    // 4. Perform the upgrade
    try {
        await prisma.tenant.update({
            where: {
                id: token.tenantId, // Use token.tenantId
            },
            data: {
                plan: 'PRO',
            },
        });

        return NextResponse.json({ status: 'upgraded' });

    } catch (error) { // This 'error' is what the warning was about
        return NextResponse.json({ error: 'Failed to upgrade plan' }, { status: 500 });
    }
}