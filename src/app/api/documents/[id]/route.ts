import { NextRequest, NextResponse } from 'next/server';
import { AppError } from '@/lib/errors/AppError';
import { documentRepository } from '@/repositories/DocumentRepository';
import type { DocumentDetailResponse } from '@/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<DocumentDetailResponse | { error: string }>> {
  try {
    const { id } = await params;

    const document = await documentRepository.findByIdWithChunkCount(id);

    if (!document) {
      return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }

    return NextResponse.json({
      id: document.id,
      title: document.title,
      status: document.status,
      chunkCount: document.chunkCount,
      metadata: document.metadata,
    });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    console.error('[GET /api/documents/[id]] Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to fetch document.' }, { status: 500 });
  }
}
