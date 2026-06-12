-- Migrate embedding column from VECTOR(1536) to VECTOR(768).
-- Required for Ollama nomic-embed-text, which produces 768-dimensional vectors.
-- pgvector does not allow in-place dimension changes; existing embeddings are
-- dropped here and will be regenerated when documents are reprocessed.

ALTER TABLE document_chunks DROP COLUMN embedding;
ALTER TABLE document_chunks ADD COLUMN embedding VECTOR(768);
