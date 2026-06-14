import type { ChatApiResponse } from '@/types';

export interface ChatRequestOptions {
  message: string;
  projectId: string;
}

export async function sendChatMessage(opts: ChatRequestOptions): Promise<ChatApiResponse> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: opts.message, projectId: opts.projectId }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  return json as ChatApiResponse;
}
