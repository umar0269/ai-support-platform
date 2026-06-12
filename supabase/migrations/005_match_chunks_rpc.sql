-- Vector similarity search function used by the RAG retrieval pipeline.
-- Returns the top N chunks ordered by cosine similarity to the query embedding.

CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding VECTOR(768),
  match_count     INT DEFAULT 5
)
RETURNS TABLE (
  id          UUID,
  document_id UUID,
  title       TEXT,
  content     TEXT,
  similarity  FLOAT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    dc.id,
    dc.document_id,
    d.title,
    dc.content,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  JOIN documents d ON dc.document_id = d.id
  WHERE dc.embedding IS NOT NULL
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- HNSW index for fast approximate cosine-distance lookups.
-- Build after the column exists; drop and recreate when dimension changes.
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_hnsw
  ON document_chunks
  USING hnsw (embedding vector_cosine_ops);
