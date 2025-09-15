import { NextResponse } from 'next/server';
import { auth } from '@/auth'; // <-- Use auth, not getToken
import prisma from '@/lib/prisma';

// 🛑 Removed cookieName and getToken imports

// GET /api/notes/:id
export async function GET(
    request: Request,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: any
) {
    const params = context.params;
    const session = await auth(); // <-- Reverted to auth()

    if (!session?.user?.tenantId) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const note = await prisma.note.findFirst({
        where: {
            id: params.id,
            tenantId: session.user.tenantId, // Use session.user
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
    context: any
) {
    const params = context.params;
    const session = await auth(); // <-- Reverted to auth()

    if (!session?.user?.tenantId) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { content } = (await request.json()) as { content: string };
    try {
        const result = await prisma.note.updateMany({
            where: {
                id: params.id,
                tenantId: session.user.tenantId, // Use session.user
            },
            data: { content },
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
    context: any
) {
    const params = context.params;
    const session = await auth(); // <-- Reverted to auth()

    if (!session?.user?.tenantId) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const result = await prisma.note.deleteMany({
            where: {
                id: params.id,
                tenantId: session.user.tenantId, // Use session.user
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