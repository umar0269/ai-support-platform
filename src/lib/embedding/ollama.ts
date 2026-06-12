import { AppError } from '@/lib/errors/AppError';
import type { EmbeddingProvider } from './types';

const EXPECTED_DIMENSIONS = 768;
const TIMEOUT_MS = 30_000;

export class OllamaEmbeddingProvider implements EmbeddingProvider {
  constructor(
    private readonly baseUrl: string,
    private readonly model: string,
  ) {}

  async generateEmbedding(text: string): Promise<number[]> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: this.model, prompt: text }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new AppError(`Ollama API error ${response.status}: ${body}`);
      }

      const json = await response.json();
      const embedding: number[] = json.embedding;

      if (!Array.isArray(embedding) || embedding.length !== EXPECTED_DIMENSIONS) {
        throw new AppError(
          `Embedding dimension mismatch: expected ${EXPECTED_DIMENSIONS}, got ${Array.isArray(embedding) ? embedding.length : 'non-array'}`,
        );
      }

      return embedding;
    } catch (err) {
      if (err instanceof AppError) throw err;
      if (err instanceof Error && err.name === 'AbortError') {
        throw new AppError(`Ollama embedding request timed out after ${TIMEOUT_MS}ms`);
      }
      throw new AppError(
        `Ollama embedding request failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      clearTimeout(timer);
    }
  }
}
