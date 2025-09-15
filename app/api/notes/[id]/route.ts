import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

// Set the cookie name based on the environment (for Vercel/localhost)
const cookieName = process.env.NODE_ENV === 'production'
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token';

// GET /api/notes/:id
export async function GET(
    request: Request,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: any // <-- APPLYING BYPASS HACK
) {
    const params = context.params; // Add this line

    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET!,
        salt: cookieName
    });

    if (!token || !token.tenantId) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const note = await prisma.note.findFirst({
        where: {
            id: params.id,
            tenantId: token.tenantId,
        },
    });

    if (!note) {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json(note);
}

// PUT /api/notes/:id
export async function PUT(
    request: Request,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: any // <-- APPLYING BYPASS HACK
) {
    const params = context.params; // Add this line

    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET!,
        salt: cookieName
    });

    if (!token || !token.tenantId) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { content } = (await request.json()) as { content: string };

    try {
        const result = await prisma.note.updateMany({
            where: {
                id: params.id,
                tenantId: token.tenantId,
            },
            data: {
                content,
            },
        });

        if (result.count === 0) {
            return NextResponse.json({ error: 'Note not found or no permission' }, { status: 404 });
        }

        return NextResponse.json({ status: 'updated' });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
    }
}

// DELETE /api/notes/:id
export async function DELETE(
    request: Request,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: any // <-- APPLYING BYPASS HACK
) {
    const params = context.params; // Add this line

    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET!,
        salt: cookieName
    });

    if (!token || !token.tenantId) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const result = await prisma.note.deleteMany({
            where: {
                id: params.id,
                tenantId: token.tenantId,
            },
        });

        if (result.count === 0) {
            return NextResponse.json({ error: 'Note not found or no permission' }, { status: 404 });
        }

        return NextResponse.json({ status: 'deleted' }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
    }
}