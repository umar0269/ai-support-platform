const STORAGE_PREFIX = 'ai_support_session';
const MAX_MESSAGES = 50;

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

function key(projectId: string): string {
  return `${STORAGE_PREFIX}_${projectId}`;
}

export function loadMessages(projectId: string): StoredMessage[] {
  try {
    const raw = localStorage.getItem(key(projectId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMessages(projectId: string, messages: StoredMessage[]): void {
  try {
    localStorage.setItem(key(projectId), JSON.stringify(messages.slice(-MAX_MESSAGES)));
  } catch {
    // localStorage may be unavailable (e.g. private browsing with strict settings)
  }
}

export function clearMessages(projectId: string): void {
  try {
    localStorage.removeItem(key(projectId));
  } catch {
    // ignore
  }
}
