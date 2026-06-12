import { getSupabaseAdmin } from '@/lib/supabase/server';
import { AppError } from '@/lib/errors/AppError';
import type {
  Document,
  DocumentStatus,
  DocumentSource,
  DocumentMetadata,
  DocumentWithChunkCount,
} from '@/types';

export interface CreateDocumentInput {
  title: string;
  source: DocumentSource;
  file_path?: string;
  status?: DocumentStatus;
  metadata?: DocumentMetadata;
}

export interface IDocumentRepository {
  create(input: CreateDocumentInput): Promise<Document>;
  updateStatus(id: string, status: DocumentStatus): Promise<void>;
  findByIdWithChunkCount(id: string): Promise<DocumentWithChunkCount | null>;
  listWithChunkCounts(): Promise<DocumentWithChunkCount[]>;
}

// Shape Supabase returns when embedding a count aggregate
type RawDocumentRow = {
  id: string;
  title: string;
  status: string;
  metadata: DocumentMetadata;
  created_at: string;
  document_chunks: Array<{ count: number }>;
};

function toDocumentWithChunkCount(row: RawDocumentRow): DocumentWithChunkCount {
  return {
    id: row.id,
    title: row.title,
    status: row.status as DocumentStatus,
    metadata: row.metadata,
    created_at: row.created_at,
    chunkCount: row.document_chunks?.[0]?.count ?? 0,
  };
}

export class DocumentRepository implements IDocumentRepository {
  async create(input: CreateDocumentInput): Promise<Document> {
    const { data, error } = await getSupabaseAdmin()
      .from('documents')
      .insert({
        title: input.title,
        source: input.source,
        file_path: input.file_path ?? null,
        status: input.status ?? 'processing',
        metadata: input.metadata ?? {},
      })
      .select()
      .single();

    if (error) {
      throw new AppError(`Failed to save document metadata: ${error.message}`, 500);
    }

    return data as Document;
  }

  async updateStatus(id: string, status: DocumentStatus): Promise<void> {
    const { error } = await getSupabaseAdmin()
      .from('documents')
      .update({ status })
      .eq('id', id);

    if (error) {
      throw new AppError(`Failed to update document status: ${error.message}`, 500);
    }
  }

  async findByIdWithChunkCount(id: string): Promise<DocumentWithChunkCount | null> {
    const { data, error } = await getSupabaseAdmin()
      .from('documents')
      .select('id, title, status, metadata, created_at, document_chunks(count)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // row not found
      throw new AppError(`Failed to fetch document: ${error.message}`, 500);
    }

    return toDocumentWithChunkCount(data as unknown as RawDocumentRow);
  }

  async listWithChunkCounts(): Promise<DocumentWithChunkCount[]> {
    const { data, error } = await getSupabaseAdmin()
      .from('documents')
      .select('id, title, status, metadata, created_at, document_chunks(count)')
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError(`Failed to list documents: ${error.message}`, 500);
    }

    return (data as unknown as RawDocumentRow[]).map(toDocumentWithChunkCount);
  }
}

export const documentRepository = new DocumentRepository();
