'use client';

import { useState, useEffect } from 'react';
import type { DocumentDetailResponse } from '@/types';

type State =
  | { status: 'loading' }
  | { status: 'loaded'; document: DocumentDetailResponse }
  | { status: 'error'; message: string };

export function useDocument(id: string) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState({ status: 'loading' });
      try {
        const res = await fetch(`/api/documents/${id}`);
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error((json as { error?: string }).error ?? 'Request failed');
        }
        const document: DocumentDetailResponse = await res.json();
        if (!cancelled) setState({ status: 'loaded', document });
      } catch (err) {
        if (!cancelled) {
          setState({
            status: 'error',
            message: err instanceof Error ? err.message : 'Failed to load document.',
          });
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  return { state };
}
