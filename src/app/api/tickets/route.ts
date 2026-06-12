import { NextRequest, NextResponse } from 'next/server';
import { AppError } from '@/lib/errors/AppError';
import { supportTicketRepository } from '@/repositories/SupportTicketRepository';
import type { TicketListResponse, TicketStatus } from '@/types';

const VALID_STATUSES = new Set<string>(['open', 'resolved']);

export async function GET(
  req: NextRequest,
): Promise<NextResponse<TicketListResponse | { error: string }>> {
  try {
    const statusParam = req.nextUrl.searchParams.get('status');

    let statusFilter: TicketStatus | undefined;
    if (statusParam !== null) {
      if (!VALID_STATUSES.has(statusParam)) {
        throw new AppError('status must be "open" or "resolved"', 400);
      }
      statusFilter = statusParam as TicketStatus;
    }

    const tickets = await supportTicketRepository.list(statusFilter);
    return NextResponse.json({ tickets });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    console.error('[GET /api/tickets] Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to fetch tickets.' }, { status: 500 });
  }
}
