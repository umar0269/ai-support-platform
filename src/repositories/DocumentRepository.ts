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
  findById(id: string): Promise<Document | null>;
  updateStatus(id: string, status: DocumentStatus): Promise<void>;
  deleteById(id: string): Promise<void>;
  findByIdWithChunkCount(id: string): Promise<DocumentWithChunkCount | null>;
  listWithChunkCounts(): Promise<DocumentWithChunkCount[]>;
}

// Shape Supabase returns when embedding a count aggregate
type RawDocumentRow = {
  id: string;
  title: string;
  source: string;
  status: string;
  metadata: DocumentMetadata;
  created_at: string;
  document_chunks: Array<{ count: number }>;
};

function toDocumentWithChunkCount(row: RawDocumentRow): DocumentWithChunkCount {
  return {
    id: row.id,
    title: row.title,
    source: row.source,
    status: row.status as DocumentStatus,
    metadata: row.metadata,
    created_at: row.created_at,
    chunkCount: row.document_chunks?.[0]?.count ?? 0,
  };
}

const WITH_CHUNK_COUNT_SELECT =
  'id, title, source, status, metadata, created_at, document_chunks(count)';

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

  async findById(id: string): Promise<Document | null> {
    const { data, error } = await getSupabaseAdmin()
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new AppError(`Failed to fetch document: ${error.message}`);
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

  async deleteById(id: string): Promise<void> {
    const { error } = await getSupabaseAdmin()
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      throw new AppError(`Failed to delete document: ${error.message}`);
    }
  }

  async findByIdWithChunkCount(id: string): Promise<DocumentWithChunkCount | null> {
    const { data, error } = await getSupabaseAdmin()
      .from('documents')
      .select(WITH_CHUNK_COUNT_SELECT)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new AppError(`Failed to fetch document: ${error.message}`, 500);
    }

    return toDocumentWithChunkCount(data as unknown as RawDocumentRow);
  }

  async listWithChunkCounts(): Promise<DocumentWithChunkCount[]> {
    const { data, error } = await getSupabaseAdmin()
      .from('documents')
      .select(WITH_CHUNK_COUNT_SELECT)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError(`Failed to list documents: ${error.message}`, 500);
    }

    return (data as unknown as RawDocumentRow[]).map(toDocumentWithChunkCount);
  }
}

export const documentRepository = new DocumentRepository();
