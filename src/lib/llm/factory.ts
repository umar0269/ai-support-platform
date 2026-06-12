import { AppError } from '@/lib/errors/AppError';
import { OllamaLLMProvider } from './ollama';
import type { LLMProvider } from './types';

export function createLLMProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER ?? 'ollama';

  switch (provider) {
    case 'ollama': {
      const baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
      const model = process.env.OLLAMA_CHAT_MODEL ?? 'llama3.2:3b';
      return new OllamaLLMProvider(baseUrl, model);
    }
    default:
      throw new AppError(`Unknown LLM provider: "${provider}"`, 500);
  }
}
