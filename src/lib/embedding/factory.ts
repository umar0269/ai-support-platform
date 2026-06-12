import { AppError } from '@/lib/errors/AppError';
import { OllamaEmbeddingProvider } from './ollama';
import type { EmbeddingProvider } from './types';

export function createEmbeddingProvider(): EmbeddingProvider {
  const provider = process.env.EMBEDDING_PROVIDER ?? 'ollama';

  switch (provider) {
    case 'ollama': {
      const baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
      const model = process.env.OLLAMA_EMBEDDING_MODEL ?? 'nomic-embed-text';
      return new OllamaEmbeddingProvider(baseUrl, model);
    }
    default:
      throw new AppError(`Unknown embedding provider: "${provider}"`, 500);
  }
}
