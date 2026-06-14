'use client';

import { useState, useRef, type KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
  }

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="px-3 py-3 border-t border-gray-100 bg-white rounded-b-2xl">
      <div
        className={`
          flex items-end gap-2 bg-gray-50 border rounded-xl px-3 py-2 transition-all
          ${disabled ? 'border-gray-200' : 'border-gray-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100'}
        `}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={autoResize}
          disabled={disabled}
          rows={1}
          placeholder="Ask a question…"
          aria-label="Chat message"
          className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none disabled:opacity-50 leading-relaxed max-h-28 py-0.5"
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          className={`
            shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all
            ${canSend
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <SendIcon className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-center text-[10px] text-gray-400 mt-1.5 select-none">
        Powered by AI Support · Press Enter to send
      </p>
    </div>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}
