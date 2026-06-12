'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type {
  UploadApiResponse,
  ApiErrorResponse,
  DocumentWithChunkCount,
  DocumentListResponse,
  DocumentStatus,
} from '@/types';

// ─── Upload state ──────────────────────────────────────────────────────────

type UploadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: UploadApiResponse }
  | { status: 'error'; message: string };

// ─── Document list state ───────────────────────────────────────────────────

type DocsState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; documents: DocumentWithChunkCount[] }
  | { status: 'error'; message: string };

// ─── Page ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docsState, setDocsState] = useState<DocsState>({ status: 'idle' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = useCallback(async () => {
    setDocsState({ status: 'loading' });
    try {
      const res = await fetch('/api/documents');
      if (!res.ok) throw new Error('Request failed');
      const json: DocumentListResponse = await res.json();
      setDocsState({ status: 'loaded', documents: json.documents });
    } catch {
      setDocsState({ status: 'error', message: 'Failed to load documents.' });
    }
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setUploadState({ status: 'idle' });
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setUploadState({ status: 'loading' });

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json: UploadApiResponse | ApiErrorResponse = await res.json();

      if (!res.ok || !json.success) {
        setUploadState({ status: 'error', message: (json as ApiErrorResponse).error ?? 'Upload failed.' });
        return;
      }

      setUploadState({ status: 'success', data: json as UploadApiResponse });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchDocuments(); // Refresh list after successful upload
    } catch {
      setUploadState({ status: 'error', message: 'Network error. Please check your connection and try again.' });
    }
  }

  const isLoading = uploadState.status === 'loading';

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
          <p className="mt-2 text-sm text-gray-500">
            Upload PDF documents to extract and embed their content for AI-powered support.
          </p>
        </div>

        {/* ── Upload card ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Upload Document</h2>

          <label
            htmlFor="file-upload"
            className={`
              flex flex-col items-center justify-center w-full h-40 border-2 border-dashed
              rounded-xl cursor-pointer transition-colors
              ${selectedFile
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50'
              }
            `}
          >
            <div className="flex flex-col items-center gap-2 text-center px-4">
              {selectedFile ? (
                <>
                  <FileIcon className="w-8 h-8 text-indigo-500" />
                  <span className="text-sm font-medium text-indigo-700 truncate max-w-xs">{selectedFile.name}</span>
                  <span className="text-xs text-indigo-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                </>
              ) : (
                <>
                  <UploadIcon className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    <span className="font-semibold text-indigo-600">Click to select</span> a PDF file
                  </span>
                  <span className="text-xs text-gray-400">PDF only · max 20 MB</span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </label>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className={`
              mt-5 w-full py-3 px-6 rounded-xl text-sm font-semibold transition-all
              ${!selectedFile || isLoading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[.98] shadow-sm'
              }
            `}
          >
            {isLoading
              ? <span className="flex items-center justify-center gap-2"><Spinner />Processing…</span>
              : 'Upload & Process'
            }
          </button>

          {uploadState.status === 'success' && (
            <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-4">
              <p className="text-sm font-semibold text-green-800">Upload &amp; processing complete</p>
              <ul className="mt-2 space-y-1 text-xs text-green-700">
                <li><span className="font-medium">Title:</span> {uploadState.data.title}</li>
                <li><span className="font-medium">Document ID:</span> {uploadState.data.documentId}</li>
                <li>
                  <span className="font-medium">Extracted text:</span>{' '}
                  {uploadState.data.extractedTextLength.toLocaleString()} characters
                </li>
              </ul>
            </div>
          )}

          {uploadState.status === 'error' && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="text-sm font-semibold text-red-800">Upload failed</p>
              <p className="mt-1 text-xs text-red-600">{uploadState.message}</p>
            </div>
          )}
        </div>

        {/* ── Documents list ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-800">Uploaded Documents</h2>
            <button
              onClick={fetchDocuments}
              disabled={docsState.status === 'loading'}
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-40 transition-colors"
            >
              <RefreshIcon className={`w-3.5 h-3.5 ${docsState.status === 'loading' ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {docsState.status === 'loading' && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-lg bg-gray-100 animate-pulse" />
              ))}
            </div>
          )}

          {docsState.status === 'error' && (
            <p className="text-sm text-red-500">{docsState.message}</p>
          )}

          {docsState.status === 'loaded' && docsState.documents.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No documents yet. Upload your first PDF above.</p>
          )}

          {docsState.status === 'loaded' && docsState.documents.length > 0 && (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="pb-2 px-2 font-medium">Title</th>
                    <th className="pb-2 px-2 font-medium">Status</th>
                    <th className="pb-2 px-2 font-medium text-right">Chunks</th>
                    <th className="pb-2 px-2 font-medium text-right">Uploaded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {docsState.documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2 font-medium text-gray-800 max-w-[200px] truncate">{doc.title}</td>
                      <td className="py-3 px-2">
                        <StatusBadge status={doc.status} />
                      </td>
                      <td className="py-3 px-2 text-right text-gray-600 tabular-nums">
                        {doc.chunkCount > 0 ? doc.chunkCount : '—'}
                      </td>
                      <td className="py-3 px-2 text-right text-gray-400 tabular-nums whitespace-nowrap">
                        {formatDate(doc.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────

const STATUS_STYLES: Record<DocumentStatus, string> = {
  pending:    'bg-gray-100 text-gray-600',
  processing: 'bg-amber-100 text-amber-700',
  processed:  'bg-green-100 text-green-700',
  failed:     'bg-red-100 text-red-700',
};

function StatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Icons ────────────────────────────────────────────────────────────────

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
