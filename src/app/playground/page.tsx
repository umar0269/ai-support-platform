'use client';

import { useState, useRef } from 'react';
import type { ChatApiResponse, ApiErrorResponse } from '@/types';

// ─── State machine ─────────────────────────────────────────────────────────

type PlaygroundState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: ChatApiResponse }
  | { status: 'error'; message: string };

// ─── Page ──────────────────────────────────────────────────────────────────

export default function PlaygroundPage() {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<PlaygroundState>({ status: 'idle' });
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setState({ status: 'loading' });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      const json: ChatApiResponse | ApiErrorResponse = await res.json();

      if (!res.ok) {
        setState({
          status: 'error',
          message: (json as ApiErrorResponse).error ?? 'Request failed.',
        });
        return;
      }

      setState({ status: 'success', data: json as ChatApiResponse });
    } catch {
      setState({ status: 'error', message: 'Network error. Please check your connection.' });
    }
  }

  const isLoading = state.status === 'loading';

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">RAG Playground</h1>
          <p className="mt-2 text-sm text-gray-500">
            Test the retrieval-augmented generation pipeline against your uploaded documents.
          </p>
        </div>

        {/* ── Query form ──────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <label htmlFor="query" className="block text-sm font-medium text-gray-700">
            Ask a question
          </label>
          <input
            ref={inputRef}
            id="query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            placeholder="What is your refund policy?"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className={`
              w-full py-3 px-6 rounded-xl text-sm font-semibold transition-all
              ${!query.trim() || isLoading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[.98] shadow-sm'
              }
            `}
          >
            {isLoading
              ? <span className="flex items-center justify-center gap-2"><Spinner />Thinking…</span>
              : 'Ask'
            }
          </button>
        </form>

        {/* ── Error ───────────────────────────────────────────────────────── */}
        {state.status === 'error' && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-5">
            <p className="text-sm font-semibold text-red-800">Request failed</p>
            <p className="mt-1 text-xs text-red-600">{state.message}</p>
          </div>
        )}

        {/* ── Results ─────────────────────────────────────────────────────── */}
        {state.status === 'success' && (
          <div className="space-y-5">

            {/* Needs-review banner */}
            {state.data.needsReview && (
              <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
                <WarningIcon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">Low confidence.</span>{' '}
                  This answer may not be grounded in the uploaded documents and should be reviewed.
                </p>
              </div>
            )}

            {/* Answer */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Answer</h2>
                <ConfidencePill confidence={state.data.confidence} />
              </div>
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {state.data.answer}
              </p>
            </div>

            {/* Sources */}
            {state.data.sources.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                  Sources
                </h2>
                <div className="divide-y divide-gray-50">
                  {state.data.sources.map((src, i) => (
                    <div key={src.documentId + i} className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-gray-400 tabular-nums w-4 shrink-0">{i + 1}.</span>
                        <span className="text-sm text-gray-700 font-medium truncate">{src.title}</span>
                      </div>
                      <SimilarityBadge value={src.similarity} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Debug panel */}
            <details className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <summary className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none">
                Debug — raw similarity scores
              </summary>
              <div className="px-6 pb-5">
                {state.data.sources.length === 0 ? (
                  <p className="text-xs text-gray-400">No chunks retrieved.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {state.data.sources.map((src, i) => (
                      <span
                        key={src.documentId + i}
                        className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-mono text-gray-600"
                      >
                        <span className="truncate max-w-[140px]">{src.title}</span>
                        <span className="font-semibold text-gray-800">{src.similarity.toFixed(4)}</span>
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                  Confidence threshold for review: 0.75 &nbsp;·&nbsp; Max similarity:{' '}
                  <span className="font-mono font-semibold text-gray-600">
                    {state.data.confidence.toFixed(4)}
                  </span>
                </div>
              </div>
            </details>

          </div>
        )}

      </div>
    </main>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function ConfidencePill({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const colorClass =
    confidence >= 0.85
      ? 'bg-green-100 text-green-700'
      : confidence >= 0.75
        ? 'bg-amber-100 text-amber-700'
        : 'bg-red-100 text-red-700';

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
      Confidence: {pct}%
    </span>
  );
}

function SimilarityBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const colorClass =
    value >= 0.85
      ? 'text-green-700 bg-green-50'
      : value >= 0.75
        ? 'text-amber-700 bg-amber-50'
        : 'text-gray-600 bg-gray-100';

  return (
    <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${colorClass}`}>
      {pct}%
    </span>
  );
}

// ─── Icons ─────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}
