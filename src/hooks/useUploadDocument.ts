'use client';

import { useState, useCallback } from 'react';
import type { UploadApiResponse, ApiErrorResponse } from '@/types';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: UploadApiResponse }
  | { status: 'error'; message: string };

export function useUploadDocument() {
  const [state, setState] = useState<State>({ status: 'idle' });

  const upload = useCallback(async (file: File) => {
    setState({ status: 'loading' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json: UploadApiResponse | ApiErrorResponse = await res.json();

      if (!res.ok || !json.success) {
        setState({
          status: 'error',
          message: (json as ApiErrorResponse).error ?? 'Upload failed.',
        });
        return;
      }

      setState({ status: 'success', data: json as UploadApiResponse });
    } catch {
      setState({ status: 'error', message: 'Network error. Please check your connection.' });
    }
  }, []);

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { state, upload, reset };
}
