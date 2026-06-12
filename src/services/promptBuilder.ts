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
      'Answer ONLY using the information provided in the context below.',
      `If the answer cannot be found in the context, respond exactly with:`,
      `"${FALLBACK_RESPONSE}"`,
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
