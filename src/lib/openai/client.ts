import OpenAI from 'openai';
import { AppError } from '@/lib/errors/AppError';

let _client: OpenAI | null = null;

// Lazily created OpenAI client. Never import in client components.
export function getOpenAIClient(): OpenAI {
  if (_client) return _client;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AppError('OPENAI_API_KEY environment variable is required.', 500);
  }

  _client = new OpenAI({ apiKey });
  return _client;
}
