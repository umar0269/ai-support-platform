import {
  supportTicketRepository,
  type ISupportTicketRepository,
} from '@/repositories/SupportTicketRepository';
import type { ChatSource, TicketPriority } from '@/types';

// ─── n8n webhook ───────────────────────────────────────────────────────────
//
// Configure your n8n workflow:
//   1. Add a Webhook trigger node  →  copy its URL into N8N_ESCALATION_WEBHOOK_URL
//   2. Add an IF node to validate the payload (check "confidence" exists)
//   3. Add a Slack node:
//        Channel: #support-alerts
//        Text:    🚨 *AI Support Escalation*
//                 *Question:* {{ $json.question }}
//                 *Confidence:* {{ ($json.confidence * 100).toFixed(0) }}%
//                 *Priority:* {{ $json.priority.toUpperCase() }}
//
//                 *Answer (AI):*
//                 {{ $json.answer }}
//
//                 *Ticket ID:* {{ $json.ticketId }}
//                 _Action Required: Human review needed_

const WEBHOOK_TIMEOUT_MS = 10_000;

export interface EscalateInput {
  question: string;
  answer: string;
  confidence: number;
  sources: ChatSource[];
}

type WebhookPayload = {
  ticketId: string;
  question: string;
  answer: string;
  confidence: number;
  sources: ChatSource[];
  priority: TicketPriority;
  createdAt: string;
};

function getPriority(confidence: number): TicketPriority {
  return confidence < 0.5 ? 'high' : 'medium';
}

export interface IEscalationService {
  escalate(input: EscalateInput): Promise<void>;
}

export class EscalationService implements IEscalationService {
  constructor(private readonly tickets: ISupportTicketRepository) {}

  async escalate(input: EscalateInput): Promise<void> {
    // Step 1 — persist the ticket; if this fails we log and bail out
    let ticketId: string;
    try {
      const ticket = await this.tickets.create({
        question: input.question,
        answer: input.answer,
        confidence: input.confidence,
        sources: input.sources,
      });
      ticketId = ticket.id;
    } catch (err) {
      console.error(
        '[EscalationService] Failed to create support ticket:',
        err instanceof Error ? err.message : err,
      );
      return;
    }

    // Step 2 — notify via n8n webhook; failure must never surface to the user
    const webhookUrl = process.env.N8N_ESCALATION_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('[EscalationService] N8N_ESCALATION_WEBHOOK_URL is not set — skipping webhook');
      return;
    }

    const payload: WebhookPayload = {
      ticketId,
      question: input.question,
      answer: input.answer,
      confidence: input.confidence,
      sources: input.sources,
      priority: getPriority(input.confidence),
      createdAt: new Date().toISOString(),
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        console.error(`[EscalationService] Webhook responded ${res.status}: ${body}`);
      }
    } catch (err) {
      const reason =
        err instanceof Error && err.name === 'AbortError'
          ? `timed out after ${WEBHOOK_TIMEOUT_MS}ms`
          : err instanceof Error ? err.message : String(err);
      console.error(`[EscalationService] Webhook delivery failed: ${reason}`);
    } finally {
      clearTimeout(timer);
    }
  }
}

export const escalationService = new EscalationService(supportTicketRepository);
