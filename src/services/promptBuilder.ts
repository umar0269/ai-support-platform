import type { RetrievedChunk } from '@/types';

const FALLBACK_RESPONSE =
  "I don't have enough information to answer that confidently.";

export interface IPromptBuilder {
  build(chunks: RetrievedChunk[], question: string): string;
}

export class PromptBuilder implements IPromptBuilder {
  build(chunks: RetrievedChunk[], question: string): string {
    const context =
      chunks.length === 0
        ? '(No relevant context found.)'
        : chunks
            .map((c) => `--- Source: ${c.title} ---\n${c.content}`)
            .join('\n\n');

    return [
      'You are an AI customer support assistant.',
      '',
      'Rules you MUST follow:',
      '1. Answer using ONLY information explicitly stated in the context below. Do not infer, combine, or assume relationships between facts unless the context states them directly.',
      '2. Do not paraphrase in a way that changes meaning. Preserve every distinct fact as written.',
      '3. If the context does not contain enough information to answer fully, respond exactly with:',
      `   "${FALLBACK_RESPONSE}"`,
      '',
      'Context:',
      context,
      '',
      'User Question:',
      question,
    ].join('\n');
  }
}

export const promptBuilder = new PromptBuilder();
