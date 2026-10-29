import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

function getUserIdFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        return payload.id || payload.sub || payload.userId || null;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUserId = getUserIdFromRequest(request);

    if (!id) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    if (authUserId) {
      await pool.query('DELETE FROM saved_cards WHERE id = $1 AND user_id = $2', [id, authUserId]);
    } else {
      await pool.query('DELETE FROM saved_cards WHERE id = $1', [id]);
    }

    return NextResponse.json({ success: true, message: 'Card removed successfully' });
  } catch (error: any) {
    console.error('Error removing card:', error);
    return NextResponse.json({ error: 'Failed to remove card', details: error.message }, { status: 500 });
  }
}
