import { NextResponse } from 'next/server';
import { AppError } from '@/lib/errors/AppError';
import { documentRepository } from '@/repositories/DocumentRepository';
import type { DocumentListResponse } from '@/types';

export async function GET(): Promise<NextResponse<DocumentListResponse | { error: string }>> {
  try {
    const documents = await documentRepository.listWithChunkCounts();
    return NextResponse.json({ documents });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    console.error('[GET /api/documents] Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to fetch documents.' }, { status: 500 });
  }
}
