'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDocuments } from '@/hooks/useDocuments';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { DocumentWithChunkCount } from '@/types';

export default function DocumentsPage() {
  const { state, deletingId, refetch, deleteDocument } = useDocuments();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  async function handleConfirmDelete(id: string) {
    const ok = await deleteDocument(id);
    if (ok) setPendingDeleteId(null);
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="mt-1 text-sm text-gray-500">All documents in the knowledge base</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refetch}
            disabled={state.status === 'loading'}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-40 transition-colors"
          >
            <RefreshIcon className={`w-3.5 h-3.5 ${state.status === 'loading' ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/admin/upload"
            className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Upload PDF
          </Link>
        </div>
      </div>

      {/* ── Table card ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Loading skeleton */}
        {state.status === 'loading' && (
          <div className="divide-y divide-gray-50">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-12 bg-gray-100 rounded animate-pulse" />
                <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse ml-auto" />
                <div className="h-4 w-8 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {state.status === 'error' && (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-red-500 font-medium">{state.message}</p>
            <button
              onClick={refetch}
              className="mt-3 text-xs text-indigo-600 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {state.status === 'loaded' && state.documents.length === 0 && (
          <div className="px-6 py-16 text-center">
            <DocumentStackIcon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">No documents uploaded yet.</p>
            <Link
              href="/admin/upload"
              className="mt-4 inline-block text-xs font-semibold text-indigo-600 hover:underline"
            >
              Upload your first PDF →
            </Link>
          </div>
        )}

        {/* Table */}
        {state.status === 'loaded' && state.documents.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                <th className="text-left px-6 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Source</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Chunks</th>
                <th className="text-right px-4 py-3 font-medium">Uploaded</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {state.documents.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  isDeleting={deletingId === doc.id}
                  pendingDelete={pendingDeleteId === doc.id}
                  onDeleteClick={() => setPendingDeleteId(doc.id)}
                  onDeleteConfirm={() => handleConfirmDelete(doc.id)}
                  onDeleteCancel={() => setPendingDeleteId(null)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── DocumentRow ──────────────────────────────────────────────────────────

function DocumentRow({
  doc,
  isDeleting,
  pendingDelete,
  onDeleteClick,
  onDeleteConfirm,
  onDeleteCancel,
}: {
  doc: DocumentWithChunkCount;
  isDeleting: boolean;
  pendingDelete: boolean;
  onDeleteClick: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}) {
  return (
    <tr className="hover:bg-gray-50/60 transition-colors">
      <td className="px-6 py-3.5">
        <Link
          href={`/admin/documents/${doc.id}`}
          className="font-medium text-gray-900 hover:text-indigo-600 transition-colors truncate max-w-xs block"
        >
          {doc.title}
        </Link>
      </td>
      <td className="px-4 py-3.5">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 uppercase tracking-wide">
          {doc.source}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <StatusBadge status={doc.status} />
      </td>
      <td className="px-4 py-3.5 text-right tabular-nums text-gray-600">
        {doc.chunkCount > 0 ? doc.chunkCount : '—'}
      </td>
      <td className="px-4 py-3.5 text-right text-gray-400 text-xs whitespace-nowrap">
        {formatDate(doc.created_at)}
      </td>
      <td className="px-6 py-3.5">
        <div className="flex items-center justify-end gap-2 text-xs">
          {pendingDelete ? (
            <>
              <span className="text-gray-500 mr-1">Delete?</span>
              <button
                onClick={onDeleteConfirm}
                disabled={isDeleting}
                className="font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting…' : 'Confirm'}
              </button>
              <button onClick={onDeleteCancel} className="text-gray-400 hover:text-gray-600">
                Cancel
              </button>
            </>
          ) : (
            <>
              <Link
                href={`/admin/documents/${doc.id}`}
                className="font-medium text-indigo-600 hover:text-indigo-800"
              >
                View
              </Link>
              <span className="text-gray-200">|</span>
              <button
                onClick={onDeleteClick}
                className="font-medium text-gray-400 hover:text-red-600 transition-colors"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Helpers & icons ───────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function DocumentStackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878M18 6.878A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122" />
    </svg>
  );
}
