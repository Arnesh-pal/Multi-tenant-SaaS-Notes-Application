import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ status: 'ok' });
    // Note: Global CORS headers will be applied by next.config.js
}