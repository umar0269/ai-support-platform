import { NextRequest, NextResponse } from 'next/server';
import { AppError } from '@/lib/errors/AppError';
import { documentRepository } from '@/repositories/DocumentRepository';
import { chunksRepository } from '@/repositories/ChunksRepository';
import { deleteDocumentService } from '@/services/document/DeleteDocumentService';
import type { DocumentDetailResponse } from '@/types';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  _req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse<DocumentDetailResponse | { error: string }>> {
  try {
    const { id } = await params;

    const [document, chunks] = await Promise.all([
      documentRepository.findByIdWithChunkCount(id),
      chunksRepository.findByDocumentId(id),
    ]);

    if (!document) {
      return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }

    return NextResponse.json({
      id: document.id,
      title: document.title,
      source: document.source,
      status: document.status,
      chunkCount: document.chunkCount,
      metadata: document.metadata,
      created_at: document.created_at,
      chunks,
    });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    console.error('[GET /api/documents/[id]] Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to fetch document.' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse<{ success: true } | { error: string }>> {
  try {
    const { id } = await params;
    await deleteDocumentService.execute(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    console.error('[DELETE /api/documents/[id]] Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to delete document.' }, { status: 500 });
  }
}
