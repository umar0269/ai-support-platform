'use client';

import { useState, useCallback, useEffect } from 'react';
import type { DocumentWithChunkCount, DocumentListResponse } from '@/types';

type State =
  | { status: 'loading' }
  | { status: 'loaded'; documents: DocumentWithChunkCount[] }
  | { status: 'error'; message: string };

export function useDocuments() {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const res = await fetch('/api/documents');
      if (!res.ok) throw new Error('Request failed');
      const json: DocumentListResponse = await res.json();
      setState({ status: 'loaded', documents: json.documents });
    } catch {
      setState({ status: 'error', message: 'Failed to load documents.' });
    }
  }, []);

  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error ?? 'Delete failed');
      }
      // Optimistic removal from local state
      setState((prev) =>
        prev.status === 'loaded'
          ? { status: 'loaded', documents: prev.documents.filter((d) => d.id !== id) }
          : prev,
      );
      return true;
    } catch (err) {
      setState({ status: 'error', message: err instanceof Error ? err.message : 'Delete failed.' });
      return false;
    } finally {
      setDeletingId(null);
    }
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  return { state, deletingId, refetch: fetchDocuments, deleteDocument };
}
