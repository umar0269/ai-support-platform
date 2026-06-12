import { NextRequest, NextResponse } from 'next/server';
import { AppError } from '@/lib/errors/AppError';
import { chatService } from '@/services/chatService';
import type { ChatApiResponse, ApiErrorResponse } from '@/types';

// Local LLM generation can be slow; extend the serverless timeout for Vercel deployments.
export const maxDuration = 120;

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ChatApiResponse | ApiErrorResponse>> {
  try {
    const body = await req.json().catch(() => null);
    const message: unknown = body?.message;

    if (typeof message !== 'string' || message.trim() === '') {
      throw new AppError('Request body must include a non-empty "message" field.', 400);
    }

    const result = await chatService.chat(message.trim());
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: err.statusCode },
      );
    }
    console.error('[POST /api/chat] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 },
    );
  }
}
