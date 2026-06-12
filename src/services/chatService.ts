import { createLLMProvider, type LLMProvider } from '@/lib/llm';
import { retrievalService, type IRetrievalService } from '@/services/retrievalService';
import { promptBuilder, type IPromptBuilder } from '@/services/promptBuilder';
import type { ChatResult } from '@/types';

const CONFIDENCE_REVIEW_THRESHOLD = 0.75;

export interface IChatService {
  chat(question: string): Promise<ChatResult>;
}

export class ChatService implements IChatService {
  constructor(
    private readonly retrieval: IRetrievalService,
    private readonly prompts: IPromptBuilder,
    private readonly llm: LLMProvider,
  ) {}

  async chat(question: string): Promise<ChatResult> {
    const chunks = await this.retrieval.retrieveRelevantChunks(question);

    const prompt = this.prompts.build(chunks, question);
    const answer = await this.llm.generateResponse(prompt);

    const confidence = chunks.length > 0
      ? Math.max(...chunks.map((c) => c.similarity))
      : 0;

    const sources = chunks.map((c) => ({
      documentId: c.documentId,
      title: c.title,
      similarity: c.similarity,
    }));

    const result: ChatResult = { answer, sources, confidence };
    if (confidence < CONFIDENCE_REVIEW_THRESHOLD) {
      result.needsReview = true;
    }

    return result;
  }
}

export const chatService = new ChatService(
  retrievalService,
  promptBuilder,
  createLLMProvider(),
);
