-- Performance indexes for Phase 2 query patterns

-- Status filter (admin list, polling by status)
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- Default sort order for the admin document list
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
