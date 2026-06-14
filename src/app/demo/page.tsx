'use client';

import { useState } from 'react';
import { ChatWidget } from '@/components/widget/ChatWidget';

const EMBED_SNIPPET = `<!-- AI Support Widget -->
<script>
  window.AI_SUPPORT_CONFIG = {
    apiUrl: "https://your-domain.com",
    projectId: "your-project-id"
  };
</script>
<script src="https://your-domain.com/widget.js" async></script>`;

export default function DemoPage() {
  const [copied, setCopied] = useState(false);

  async function copySnippet() {
    await navigator.clipboard.writeText(EMBED_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">

        {/* Header */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full mb-4">
            Phase 6 · Embeddable Widget
          </span>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            Chat Widget Demo
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            A production-ready embeddable AI support widget. Click the button in the
            bottom-right corner to try it.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: '⚡', title: 'Instant Embed', desc: 'One <script> tag on any website' },
            { icon: '🧠', title: 'RAG Powered', desc: 'Answers grounded in your docs' },
            { icon: '💬', title: 'Session Memory', desc: 'Conversation persists via localStorage' },
            { icon: '🏢', title: 'Multi-Tenant', desc: 'Isolated per projectId' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <span className="text-2xl">{f.icon}</span>
              <p className="mt-2 text-sm font-semibold text-gray-900">{f.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Embed code */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-900">Embed Code</p>
              <p className="text-xs text-gray-500 mt-0.5">Paste this before &lt;/body&gt; on any page</p>
            </div>
            <button
              onClick={copySnippet}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${copied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="p-5 text-xs text-gray-700 bg-gray-50 overflow-x-auto leading-relaxed font-mono">
            {EMBED_SNIPPET}
          </pre>
        </div>

        {/* Direct iframe embed */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Direct iframe embed</p>
            <p className="text-xs text-gray-500 mt-0.5">Use this if you prefer iframes over script injection</p>
          </div>
          <pre className="p-5 text-xs text-gray-700 bg-gray-50 overflow-x-auto leading-relaxed font-mono">
            {`<iframe\n  src="https://your-domain.com/widget-frame?projectId=demo"\n  width="375"\n  height="520"\n  style="border:none;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.15);"\n></iframe>`}
          </pre>
        </div>

        {/* API info */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">API Reference</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="shrink-0 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-mono font-bold rounded">POST</span>
              <div>
                <p className="text-sm font-mono text-gray-800">/api/chat</p>
                <p className="text-xs text-gray-500 mt-0.5">Body: <code className="bg-gray-100 px-1 rounded">{'{ "message": "string", "projectId": "string" }'}</code></p>
                <p className="text-xs text-gray-500">Response: <code className="bg-gray-100 px-1 rounded">{'{ "answer": "string", "sources": [], "confidence": 0.82, "needsReview": false }'}</code></p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400">
          The chat widget is visible in the bottom-right corner of this page.
        </p>
      </div>

      {/* The actual embedded widget */}
      <ChatWidget projectId="demo" />
    </main>
  );
}
