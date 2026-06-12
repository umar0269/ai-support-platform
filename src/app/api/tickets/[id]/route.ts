import { NextRequest, NextResponse } from 'next/server';
import { AppError } from '@/lib/errors/AppError';
import { supportTicketRepository } from '@/repositories/SupportTicketRepository';
import type { TicketStatus } from '@/types';

const VALID_STATUSES = new Set<string>(['open', 'resolved']);

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(
  req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse<{ success: true } | { error: string }>> {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const status: unknown = body?.status;

    if (typeof status !== 'string' || !VALID_STATUSES.has(status)) {
      throw new AppError('Body must include status: "open" | "resolved"', 400);
    }

    await supportTicketRepository.updateStatus(id, status as TicketStatus);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    console.error('[PATCH /api/tickets/[id]] Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to update ticket.' }, { status: 500 });
  }
}
