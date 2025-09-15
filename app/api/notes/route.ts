export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/auth'; // <-- Use auth, not getToken
import prisma from '@/lib/prisma';
import { Plan } from '@prisma/client';

// 🛑 Removed cookieName and getToken imports

// GET /api/notes
export async function GET(request: Request) {
    const session = await auth(); // <-- Reverted to auth()

    // Check the session object
    if (!session?.user?.tenantId) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const notes = await prisma.note.findMany({
        where: {
            tenantId: session.user.tenantId, // Use session.user
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return NextResponse.json(notes);
}

// POST /api/notes
export async function POST(request: Request) {
    const session = await auth(); // <-- Reverted to auth()

    // Check the session object. (Remember: session has 'plan', token has 'tenantPlan')
    if (!session?.user?.id || !session?.user?.tenantId || !session?.user?.plan) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check plan from session.user
    if (session.user.plan === Plan.FREE) {
        const count = await prisma.note.count({
            where: { tenantId: session.user.tenantId },
        });

        if (count >= 3) {
            return NextResponse.json(
                { error: 'Free plan limit of 3 notes reached.', code: 'ERR_LIMIT_REACHED' },
                { status: 403 }
            );
        }
    }

    const { content } = (await request.json()) as { content: string };
    if (!content) {
        return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const newNote = await prisma.note.create({
        data: {
            content,
            authorId: session.user.id, // Use session.user
            tenantId: session.user.tenantId, // Use session.user
        },
    });

    return NextResponse.json(newNote, { status: 201 });
}