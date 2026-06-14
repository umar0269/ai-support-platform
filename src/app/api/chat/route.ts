import { NextRequest, NextResponse } from 'next/server';
import { AppError } from '@/lib/errors/AppError';
import { chatService } from '@/services/chatService';
import { escalationService } from '@/services/escalationService';
import type { ChatApiResponse, ApiErrorResponse } from '@/types';

// Local LLM generation can be slow; extend the serverless timeout for Vercel deployments.
export const maxDuration = 120;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// Escalation fires when confidence is below this threshold OR the answer signals uncertainty.
// Intentionally higher than ChatService's needsReview threshold (0.45).
const ESCALATION_THRESHOLD = 0.45;

const UNCERTAINTY_PATTERNS = [
  "i don't have enough information",
  "not enough information",
  "cannot be found in the context",
  "i don't know",
];

function isUncertain(answer: string): boolean {
  const lower = answer.toLowerCase();
  return UNCERTAINTY_PATTERNS.some((p) => lower.includes(p));
}

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ChatApiResponse | ApiErrorResponse>> {
  try {
    const body = await req.json().catch(() => null);
    const message: unknown = body?.message;
    // projectId is accepted now and will be used for per-tenant knowledge isolation
    // once the retrieval layer is extended to filter by project.
    const _projectId: string = typeof body?.projectId === 'string' ? body.projectId : 'default';

    if (typeof message !== 'string' || message.trim() === '') {
      throw new AppError('Request body must include a non-empty "message" field.', 400);
    }

    const question = message.trim();
    const result = await chatService.chat(question);

    // Fire-and-forget: escalation must never delay or break the response.
    // NOTE: for Vercel production use `after()` from 'next/server' instead.
    if (result.confidence < ESCALATION_THRESHOLD || isUncertain(result.answer)) {
      escalationService
        .escalate({
          question,
          answer: result.answer,
          confidence: result.confidence,
          sources: result.sources,
        })
        .catch((err) => {
          console.error('[POST /api/chat] Escalation error:', err instanceof Error ? err.message : err);
        });
    }

    return NextResponse.json(result, { headers: CORS_HEADERS });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: err.statusCode, headers: CORS_HEADERS },
      );
    }
    console.error('[POST /api/chat] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
