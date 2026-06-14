'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatBubble, TypingBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';
import { sendChatMessage } from '@/lib/widget/api';
import { loadMessages, saveMessages, clearMessages, type StoredMessage } from '@/lib/widget/storage';

interface ChatWindowProps {
  projectId?: string;
  onClose?: () => void;
  className?: string;
}

const WELCOME: StoredMessage = {
  id: '__welcome__',
  role: 'assistant',
  content: "Hi! I'm your AI support assistant. Ask me anything about our products or services.",
  timestamp: 0,
};

export function ChatWindow({ projectId = 'default', onClose, className = '' }: ChatWindowProps) {
  const [messages, setMessages] = useState<StoredMessage[]>([WELCOME]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = loadMessages(projectId);
    if (stored.length > 0) setMessages(stored);
  }, [projectId]);

  useEffect(() => {
    const userMessages = messages.filter((m) => m.id !== '__welcome__');
    if (userMessages.length > 0) saveMessages(projectId, messages);
  }, [messages, projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Notify iframe parent to close
  const notifyClose = useCallback(() => {
    try {
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'AI_WIDGET_CLOSE' }, '*');
      }
    } catch {
      // cross-origin parent without permission — safe to ignore
    }
  }, []);

  function handleClose() {
    notifyClose();
    onClose?.();
  }

  function handleClear() {
    clearMessages(projectId);
    setMessages([WELCOME]);
    setError(null);
  }

  async function handleSend(text: string) {
    const userMsg: StoredMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const result = await sendChatMessage({ message: text, projectId });

      const aiMsg: StoredMessage = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: result.answer,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setError("Sorry, I couldn't get a response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={`flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200 ${className}`}>
      <ChatHeader onClose={handleClose} onClear={handleClear} />

      <div
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        className="flex-1 overflow-y-auto px-3 py-4"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}
      >
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {isLoading && <TypingBubble />}

        {error && (
          <div className="mb-3 mx-1 p-3 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-xs text-red-600">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-1 text-xs text-red-500 underline hover:text-red-700"
            >
              Dismiss
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
