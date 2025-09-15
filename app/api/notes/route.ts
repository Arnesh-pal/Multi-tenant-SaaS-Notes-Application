import { NextResponse } from 'next/server';
// We are using 'getToken' now, so 'auth' is not needed here.
// import { auth } from '@/auth'; 
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

// 🛑 The 'interface RouteParams' has been DELETED

// GET /api/notes/:id
// Retrieves a specific note, checking tenant isolation
export async function GET(request: Request, { params }: { params: { id: string } }) { // <-- FIX HERE
    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET!,
        salt: "authjs.session-token"
    });

    if (!token || !token.tenantId) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const note = await prisma.note.findFirst({
        where: {
            id: params.id,
            tenantId: token.tenantId, // CRITICAL: Ensures user can only get their own tenant's notes
        },
    });

    if (!note) {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json(note);
}

// PUT /api/notes/:id
// Updates a specific note, checking tenant isolation
export async function PUT(request: Request, { params }: { params: { id: string } }) { // <-- FIX HERE
    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET!,
        salt: "authjs.session-token"
    });

    if (!token || !token.tenantId) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { content } = (await request.json()) as { content: string };

    try {
        const result = await prisma.note.updateMany({
            where: {
                id: params.id,
                tenantId: token.tenantId, // CRITICAL: Ensures user can only update their own tenant's notes
            },
            data: {
                content,
            },
        });

        if (result.count === 0) {
            return NextResponse.json({ error: 'Note not found or no permission' }, { status: 404 });
        }

        return NextResponse.json({ status: 'updated' });

    } catch (error) { // This 'error' is what the warning was about
        return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
    }
}

// DELETE /api/notes/:id
// Deletes a specific note, checking tenant isolation
export async function DELETE(request: Request, { params }: { params: { id: string } }) { // <-- FIX HERE
    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET!,
        salt: "authjs.session-token"
    });

    if (!token || !token.tenantId) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const result = await prisma.note.deleteMany({
            where: {
                id: params.id,
                tenantId: token.tenantId, // CRITICAL: Ensures user can only delete their own tenant's notes
            },
        });

        if (result.count === 0) {
            return NextResponse.json({ error: 'Note not found or no permission' }, { status: 404 });
        }

        return NextResponse.json({ status: 'deleted' }, { status: 200 });

    } catch (error) { // This 'error' is what the warning was about
        return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
    }
}