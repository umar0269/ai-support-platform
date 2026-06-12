'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useDocument } from '@/hooks/useDocument';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { ChunkSummary } from '@/types';

const CONTENT_PREVIEW_LENGTH = 300;

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useDocument(id);

  return (
    <div className="p-6 md:p-10 max-w-5xl">

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div className="mb-6">
        <Link
          href="/admin/documents"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeftIcon className="w-3.5 h-3.5" />
          Documents
        </Link>
      </div>

      {/* ── Loading ─────────────────────────────────────────────────────── */}
      {state.status === 'loading' && (
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded" />
          <div className="h-40 bg-gray-100 rounded-2xl" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      )}

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {state.status === 'error' && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-6">
          <p className="text-sm font-semibold text-red-800">Failed to load document</p>
          <p className="mt-1 text-xs text-red-600">{state.message}</p>
          <Link href="/admin/documents" className="mt-3 inline-block text-xs text-indigo-600 hover:underline">
            ← Back to documents
          </Link>
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {state.status === 'loaded' && (() => {
        const doc = state.document;
        return (
          <div className="space-y-6">

            {/* Title */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{doc.title}</h1>
                {doc.metadata.original_filename && doc.metadata.original_filename !== doc.title && (
                  <p className="mt-0.5 text-xs text-gray-400">{doc.metadata.original_filename}</p>
                )}
              </div>
              <StatusBadge status={doc.status} />
            </div>

            {/* Metadata card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Document Metadata</h2>
              <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetaField label="Source" value={doc.source.toUpperCase()} />
                <MetaField label="Chunks" value={String(doc.chunkCount)} />
                <MetaField
                  label="File size"
                  value={doc.metadata.file_size ? formatBytes(doc.metadata.file_size) : '—'}
                />
                <MetaField
                  label="Pages"
                  value={doc.metadata.page_count ? String(doc.metadata.page_count) : '—'}
                />
                <MetaField
                  label="Uploaded"
                  value={formatDate(doc.created_at)}
                />
                <MetaField
                  label="MIME type"
                  value={doc.metadata.mime_type ?? '—'}
                />
              </dl>
            </div>

            {/* Chunks */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800">
                  Chunks
                  <span className="ml-2 text-xs font-normal text-gray-400">{doc.chunks.length} total</span>
                </h2>
                <span className="text-xs text-gray-400">Embedding: 768 dims (nomic-embed-text)</span>
              </div>

              {doc.chunks.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm text-gray-400">No chunks found for this document.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {doc.chunks.map((chunk) => (
                    <ChunkRow key={chunk.id} chunk={chunk} />
                  ))}
                </div>
              )}
            </div>

          </div>
        );
      })()}
    </div>
  );
}

// ─── ChunkRow ──────────────────────────────────────────────────────────────

function ChunkRow({ chunk }: { chunk: ChunkSummary }) {
  const preview =
    chunk.content.length > CONTENT_PREVIEW_LENGTH
      ? chunk.content.slice(0, CONTENT_PREVIEW_LENGTH) + '…'
      : chunk.content;

  return (
    <div className="px-6 py-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs font-mono font-semibold text-gray-400 w-8 shrink-0">
          #{chunk.chunk_index}
        </span>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${
            chunk.has_embedding
              ? 'bg-green-50 text-green-700'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          {chunk.has_embedding ? '768 ✓' : 'no embed'}
        </span>
        {chunk.estimated_tokens !== null && (
          <span className="text-[10px] text-gray-400">~{chunk.estimated_tokens} tokens</span>
        )}
      </div>
      <p className="text-xs text-gray-600 leading-relaxed font-mono pl-11 whitespace-pre-wrap">
        {preview}
      </p>
    </div>
  );
}

// ─── MetaField ─────────────────────────────────────────────────────────────

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-gray-800">{value}</dd>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}
