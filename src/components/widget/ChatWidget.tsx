'use client';

import { useState } from 'react';
import { ChatWindow } from './ChatWindow';

interface ChatWidgetProps {
  projectId?: string;
}

export function ChatWidget({ projectId = 'default' }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div
          className="w-[360px]"
          style={{
            animation: 'widgetSlideUp 0.2s ease-out',
          }}
        >
          <ChatWindow
            projectId={projectId}
            onClose={() => setIsOpen(false)}
            className="h-[520px]"
          />
        </div>
      )}

      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-expanded={isOpen}
        className="w-14 h-14 bg-indigo-600 rounded-full shadow-xl flex items-center justify-center text-white hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all duration-150"
        style={{ boxShadow: '0 4px 24px rgba(79,70,229,0.5)' }}
      >
        <span
          className="transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          {isOpen ? <ChevronDownIcon className="w-6 h-6" /> : <ChatIcon className="w-6 h-6" />}
        </span>
      </button>
    </div>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
