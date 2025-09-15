export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import { Plan } from '@prisma/client';

// GET /api/notes
// This function must only have ONE argument
export async function GET(request: Request) { // <-- FIX IS HERE
    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET!,
        salt: "authjs.session-token"
    });

    if (!token || !token.tenantId) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const notes = await prisma.note.findMany({
        where: {
            tenantId: token.tenantId,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return NextResponse.json(notes);
}

// POST /api/notes
// This function must only have ONE argument
export async function POST(request: Request) { // <-- THIS WAS ALREADY CORRECT
    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET!,
        salt: "authjs.session-token"
    });

    if (!token || !token.id || !token.tenantId || !token.tenantPlan) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // REQUIREMENT 3: Subscription Feature Gating
    if (token.tenantPlan === Plan.FREE) {
        const count = await prisma.note.count({
            where: { tenantId: token.tenantId },
        });

        if (count >= 3) {
            return NextResponse.json(
                { error: 'Free plan limit of 3 notes reached.', code: 'ERR_LIMIT_REACHED' },
                { status: 403 }
            );
        }
    }

    // If check passes, create the note
    const { content } = (await request.json()) as { content: string };
    if (!content) {
        return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const newNote = await prisma.note.create({
        data: {
            content,
            authorId: token.id,
            tenantId: token.tenantId,
        },
    });

    return NextResponse.json(newNote, { status: 201 });
}