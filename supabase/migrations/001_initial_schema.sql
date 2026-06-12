-- Enable pgvector extension for future embedding support
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents table: stores metadata for each uploaded document
CREATE TABLE documents (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT        NOT NULL,
    source      TEXT        NOT NULL,
    file_path   TEXT,
    status      TEXT        DEFAULT 'processed',
    metadata    JSONB       DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Document chunks table: stores text chunks and their embeddings (populated in Phase 2)
CREATE TABLE document_chunks (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID        NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER     NOT NULL,
    content     TEXT        NOT NULL,
    embedding   VECTOR(1536),
    metadata    JSONB       DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups of chunks by document
CREATE INDEX idx_document_chunks_document_id ON document_chunks(document_id);

-- Auto-update updated_at on documents
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
