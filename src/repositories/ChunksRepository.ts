import { getSupabaseAdmin } from '@/lib/supabase/server';
import { AppError } from '@/lib/errors/AppError';

export interface InsertChunkInput {
  document_id: string;
  chunk_index: number;
  content: string;
  embedding: number[];
  metadata?: Record<string, unknown>;
}

export interface IChunksRepository {
  insertMany(chunks: InsertChunkInput[]): Promise<void>;
}

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
}

export const chunksRepository = new ChunksRepository();
