import { createEmbeddingProvider } from '@/lib/embedding/factory';
import type { EmbeddingProvider } from '@/lib/embedding/types';

export type IEmbeddingService = EmbeddingProvider;

export class EmbeddingService implements IEmbeddingService {
  private readonly provider: EmbeddingProvider = createEmbeddingProvider();

  generateEmbedding(text: string): Promise<number[]> {
    return this.provider.generateEmbedding(text);
  }
}

export const embeddingService = new EmbeddingService();
