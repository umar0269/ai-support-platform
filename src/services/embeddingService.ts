import { getOpenAIClient } from '@/lib/openai/client';
import { AppError } from '@/lib/errors/AppError';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EXPECTED_DIMENSIONS = 1536;

export interface IEmbeddingService {
  generateEmbedding(text: string): Promise<number[]>;
}

export class EmbeddingService implements IEmbeddingService {
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await getOpenAIClient().embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
    });

    const embedding = response.data[0].embedding;

    if (embedding.length !== EXPECTED_DIMENSIONS) {
      throw new AppError(
        `Embedding dimension mismatch: expected ${EXPECTED_DIMENSIONS}, got ${embedding.length}`,
        500,
      );
    }

    return embedding;
  }
}

export const embeddingService = new EmbeddingService();
