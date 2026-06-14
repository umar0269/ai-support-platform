'use client';

import { useState } from 'react';
import { useTickets } from '@/hooks/useTickets';
import type { SupportTicket, TicketStatus, TicketPriority } from '@/types';

type FilterValue = 'all' | TicketStatus;

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: 'All',      value: 'all' },
  { label: 'Open',     value: 'open' },
  { label: 'Resolved', value: 'resolved' },
];

export default function TicketsPage() {
  const [filter, setFilter] = useState<FilterValue>('all');
  const { state, resolvingId, refetch, resolveTicket } = useTickets(filter);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="p-6 md:p-10 ">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="mt-1 text-sm text-gray-500">Escalated conversations that need human review</p>
        </div>
        <button
          onClick={refetch}
          disabled={state.status === 'loading'}
          className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-40 transition-colors"
        >
          <RefreshIcon className={`w-3.5 h-3.5 ${state.status === 'loading' ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Filter tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setFilter(f.value); setExpandedId(null); }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === f.value
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Loading skeleton */}
        {state.status === 'loading' && (
          <div className="divide-y divide-gray-50">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="h-4 w-64 bg-gray-100 rounded" />
                <div className="h-5 w-12 bg-gray-100 rounded-full ml-auto" />
                <div className="h-5 w-16 bg-gray-100 rounded-full" />
                <div className="h-5 w-16 bg-gray-100 rounded-full" />
                <div className="h-4 w-20 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {state.status === 'error' && (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-red-500 font-medium">{state.message}</p>
            <button onClick={refetch} className="mt-3 text-xs text-indigo-600 hover:underline">
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {state.status === 'loaded' && state.tickets.length === 0 && (
          <div className="px-6 py-16 text-center">
            <CheckShieldIcon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">
              {filter === 'resolved'
                ? 'No resolved tickets yet.'
                : filter === 'open'
                  ? 'No open tickets — all clear!'
                  : 'No escalations yet. The AI is handling everything.'}
            </p>
          </div>
        )}

        {/* Table */}
        {state.status === 'loaded' && state.tickets.length > 0 && (
          <div className="divide-y divide-gray-50">
            {state.tickets.map((ticket) => (
              <TicketRow
                key={ticket.id}
                ticket={ticket}
                expanded={expandedId === ticket.id}
                resolving={resolvingId === ticket.id}
                onToggle={() => toggleExpand(ticket.id)}
                onResolve={() => resolveTicket(ticket.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TicketRow ────────────────────────────────────────────────────────────

function TicketRow({
  ticket,
  expanded,
  resolving,
  onToggle,
  onResolve,
}: {
  ticket: SupportTicket;
  expanded: boolean;
  resolving: boolean;
  onToggle: () => void;
  onResolve: () => void;
}) {
  const priority = getPriority(ticket.confidence);

  return (
    <div>
      {/* Summary row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-gray-50/60 transition-colors"
      >
        <span className="text-sm text-gray-800 font-medium truncate flex-1 min-w-0">
          {ticket.question.length > 90
            ? ticket.question.slice(0, 90) + '…'
            : ticket.question}
        </span>
        <ConfidenceChip confidence={ticket.confidence} />
        <PriorityBadge priority={priority} />
        <StatusBadge status={ticket.status} />
        <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
          {formatDate(ticket.created_at)}
        </span>
        <ChevronIcon className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-6 pb-6 bg-gray-50/40 border-t border-gray-100">
          <div className="pt-4 space-y-4">

            {/* Question */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Question</p>
              <p className="text-sm text-gray-800 leading-relaxed">{ticket.question}</p>
            </div>

            {/* Answer */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">AI Answer</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{ticket.answer}</p>
            </div>

            {/* Sources */}
            {ticket.sources.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Sources</p>
                <div className="flex flex-wrap gap-2">
                  {ticket.sources.map((src, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-3 py-1 text-xs text-gray-600"
                    >
                      {src.title}
                      <span className="font-semibold text-gray-400 font-mono">
                        {Math.round(src.similarity * 100)}%
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resolve action */}
            {ticket.status === 'open' && (
              <div className="pt-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onResolve(); }}
                  disabled={resolving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 active:scale-[.98] transition-all disabled:opacity-60"
                >
                  {resolving ? (
                    <><Spinner />Resolving…</>
                  ) : (
                    <><CheckIcon className="w-3.5 h-3.5" />Mark as Resolved</>
                  )}
                </button>
              </div>
            )}

            {ticket.status === 'resolved' && (
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-green-700 font-medium">
                  <CheckCircleIcon className="w-4 h-4" /> Resolved
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Small components ─────────────────────────────────────────────────────

function ConfidenceChip({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const cls =
    confidence < 0.5
      ? 'bg-red-100 text-red-700'
      : confidence < 0.75
        ? 'bg-amber-100 text-amber-700'
        : 'bg-green-100 text-green-700';
  return (
    <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {pct}%
    </span>
  );
}

const PRIORITY_STYLES: Record<TicketPriority, string> = {
  high:   'bg-red-50 text-red-700 border border-red-100',
  medium: 'bg-amber-50 text-amber-700 border border-amber-100',
};

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${PRIORITY_STYLES[priority]}`}>
      {priority}
    </span>
  );
}

const STATUS_STYLES: Record<TicketStatus, string> = {
  open:     'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
};

function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function getPriority(confidence: number): TicketPriority {
  return confidence < 0.5 ? 'high' : 'medium';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ─── Icons ─────────────────────────────────────────────────────────────────

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
