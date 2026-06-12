// ─── Database row shapes ───────────────────────────────────────────────────

export interface Document {
  id: string;
  title: string;
  source: string;
  file_path: string | null;
  status: DocumentStatus;
  metadata: DocumentMetadata;
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  embedding: number[] | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ─── Domain enums / literals ───────────────────────────────────────────────

export type DocumentStatus = 'pending' | 'processing' | 'processed' | 'failed';

export type DocumentSource = 'pdf' | 'url' | 'text';

// ─── Metadata shapes ───────────────────────────────────────────────────────

export interface DocumentMetadata {
  file_size?: number;
  page_count?: number;
  mime_type?: string;
  original_filename?: string;
  [key: string]: unknown;
}

// ─── Shared read model (document row + its chunk count) ───────────────────

export interface DocumentWithChunkCount {
  id: string;
  title: string;
  status: DocumentStatus;
  chunkCount: number;
  metadata: DocumentMetadata;
  created_at: string;
}

// ─── API response shapes ───────────────────────────────────────────────────

export interface UploadApiResponse {
  success: boolean;
  documentId: string;
  title: string;
  extractedTextLength: number;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}

export interface DocumentDetailResponse {
  id: string;
  title: string;
  status: DocumentStatus;
  chunkCount: number;
  metadata: DocumentMetadata;
}

export interface DocumentListResponse {
  documents: DocumentWithChunkCount[];
}
