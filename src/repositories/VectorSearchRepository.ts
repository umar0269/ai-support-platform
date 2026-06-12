import { getSupabaseAdmin } from '@/lib/supabase/server';
import { AppError } from '@/lib/errors/AppError';
import type { RetrievedChunk } from '@/types';

type MatchChunkRow = {
  id: string;
  document_id: string;
  title: string;
  content: string;
  similarity: number;
};

export interface IVectorSearchRepository {
  similaritySearch(embedding: number[], limit: number): Promise<RetrievedChunk[]>;
}

export class VectorSearchRepository implements IVectorSearchRepository {
  async similaritySearch(embedding: number[], limit: number): Promise<RetrievedChunk[]> {
    const { data, error } = await getSupabaseAdmin().rpc('match_document_chunks', {
      query_embedding: embedding,
      match_count: limit,
    });

    if (error) {
      throw new AppError(`Vector search failed: ${error.message}`);
    }

    if (!Array.isArray(data)) return [];

    return (data as MatchChunkRow[]).map((row) => ({
      id: row.id,
      documentId: row.document_id,
      title: row.title,
      content: row.content,
      similarity: row.similarity,
    }));
  }
}

export const vectorSearchRepository = new VectorSearchRepository();
