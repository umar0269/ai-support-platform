import { AppError } from '@/lib/errors/AppError';
import type { LLMProvider } from './types';

const TIMEOUT_MS = 120_000;

type OllamaChatResponse = {
  message: { role: string; content: string };
  done: boolean;
};

export class OllamaLLMProvider implements LLMProvider {
  constructor(
    private readonly baseUrl: string,
    private readonly model: string,
  ) {}

  async generateResponse(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          stream: false,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new AppError(`Ollama LLM error ${response.status}: ${body}`);
      }

      const json = (await response.json()) as OllamaChatResponse;
      const text = json?.message?.content;

      if (typeof text !== 'string' || text.trim() === '') {
        throw new AppError('Ollama returned an empty or malformed response');
      }

      return text.trim();
    } catch (err) {
      if (err instanceof AppError) throw err;
      if (err instanceof Error && err.name === 'AbortError') {
        throw new AppError(`Ollama LLM request timed out after ${TIMEOUT_MS}ms`);
      }
      throw new AppError(
        `Ollama LLM request failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      clearTimeout(timer);
    }
  }
}
