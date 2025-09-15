export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

// POST /api/tenants/:slug/upgrade
// This function signature is now fixed to the "context" pattern
export async function POST(
    request: Request,
    context: { params: { slug: string } } // <-- 1. THE FIX IS HERE
) {
    const params = context.params; // <-- 2. AND ADD THIS LINE

    // Use getToken instead of auth()
    const token = await getToken({
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
    if (token.tenantSlug !== params.slug) { // This line works because of Step 2
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

    } catch (error) {
        return NextResponse.json({ error: 'Failed to upgrade plan' }, { status: 500 });
    }
}