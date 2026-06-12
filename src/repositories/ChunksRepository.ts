import { getSupabaseAdmin } from '@/lib/supabase/server';
import { AppError } from '@/lib/errors/AppError';
import type { ChunkSummary } from '@/types';

export interface InsertChunkInput {
  document_id: string;
  chunk_index: number;
  content: string;
  embedding: number[];
  metadata?: Record<string, unknown>;
}

export interface IChunksRepository {
  insertMany(chunks: InsertChunkInput[]): Promise<void>;
  findByDocumentId(documentId: string): Promise<ChunkSummary[]>;
}

type RawChunkRow = {
  id: string;
  chunk_index: number;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export class ChunksRepository implements IChunksRepository {
  async insertMany(chunks: InsertChunkInput[]): Promise<void> {
    if (chunks.length === 0) return;

    const { error } = await getSupabaseAdmin()
      .from('document_chunks')
      .insert(chunks);

    if (error) {
      throw new AppError(`Failed to insert document chunks: ${error.message}`, 500);
    }
  }

  async findByDocumentId(documentId: string): Promise<ChunkSummary[]> {
    const { data, error } = await getSupabaseAdmin()
      .from('document_chunks')
      .select('id, chunk_index, content, metadata, created_at')
      .eq('document_id', documentId)
      .order('chunk_index', { ascending: true });

    if (error) {
      throw new AppError(`Failed to fetch chunks: ${error.message}`);
    }

    return (data as RawChunkRow[]).map((row) => ({
      id: row.id,
      chunk_index: row.chunk_index,
      content: row.content,
      has_embedding: true, // all persisted chunks pass the 768-dim validation gate
      estimated_tokens: (row.metadata?.estimated_tokens as number) ?? null,
      created_at: row.created_at,
    }));
  }
}

export const chunksRepository = new ChunksRepository();
