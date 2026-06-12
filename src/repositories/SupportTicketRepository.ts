import { getSupabaseAdmin } from '@/lib/supabase/server';
import { AppError } from '@/lib/errors/AppError';
import type { SupportTicket, TicketStatus, ChatSource } from '@/types';

export interface CreateTicketInput {
  question: string;
  answer: string;
  confidence: number;
  sources: ChatSource[];
}

export interface ISupportTicketRepository {
  create(input: CreateTicketInput): Promise<SupportTicket>;
  list(status?: TicketStatus): Promise<SupportTicket[]>;
  updateStatus(id: string, status: TicketStatus): Promise<void>;
}

export class SupportTicketRepository implements ISupportTicketRepository {
  async create(input: CreateTicketInput): Promise<SupportTicket> {
    const { data, error } = await getSupabaseAdmin()
      .from('support_tickets')
      .insert({
        question: input.question,
        answer: input.answer,
        confidence: input.confidence,
        sources: input.sources,
      })
      .select()
      .single();

    if (error) {
      throw new AppError(`Failed to create support ticket: ${error.message}`);
    }

    return data as SupportTicket;
  }

  async list(status?: TicketStatus): Promise<SupportTicket[]> {
    let query = getSupabaseAdmin()
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new AppError(`Failed to list tickets: ${error.message}`);
    }

    return data as SupportTicket[];
  }

  async updateStatus(id: string, status: TicketStatus): Promise<void> {
    const { error } = await getSupabaseAdmin()
      .from('support_tickets')
      .update({ status })
      .eq('id', id);

    if (error) {
      throw new AppError(`Failed to update ticket status: ${error.message}`);
    }
  }
}

export const supportTicketRepository = new SupportTicketRepository();
