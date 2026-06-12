'use client';

import { useState, useCallback, useEffect } from 'react';
import type { SupportTicket, TicketStatus, TicketListResponse } from '@/types';

type State =
  | { status: 'loading' }
  | { status: 'loaded'; tickets: SupportTicket[] }
  | { status: 'error'; message: string };

export function useTickets(filter: TicketStatus | 'all' = 'all') {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const url =
        filter === 'all' ? '/api/tickets' : `/api/tickets?status=${filter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Request failed');
      const json: TicketListResponse = await res.json();
      setState({ status: 'loaded', tickets: json.tickets });
    } catch {
      setState({ status: 'error', message: 'Failed to load tickets.' });
    }
  }, [filter]);

  const resolveTicket = useCallback(async (id: string): Promise<void> => {
    setResolvingId(id);
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' }),
      });
      if (!res.ok) throw new Error('Failed to resolve ticket');
      setState((prev) =>
        prev.status === 'loaded'
          ? {
              status: 'loaded',
              tickets: prev.tickets.map((t) =>
                t.id === id ? { ...t, status: 'resolved' as TicketStatus } : t,
              ),
            }
          : prev,
      );
    } catch (err) {
      console.error('[useTickets] resolveTicket:', err);
    } finally {
      setResolvingId(null);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  return { state, resolvingId, refetch: fetchTickets, resolveTicket };
}
