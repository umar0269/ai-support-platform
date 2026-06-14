'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useUploadDocument } from '@/hooks/useUploadDocument';

const MAX_SIZE_BYTES = 20 * 1024 * 1024;

export default function UploadPage() {
  const { state, upload, reset } = useUploadDocument();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoading = state.status === 'loading';

  function validateAndSelect(file: File | null) {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are supported.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      alert('File exceeds the 20 MB limit.');
      return;
    }
    setSelectedFile(file);
    reset();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    validateAndSelect(e.target.files?.[0] ?? null);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    validateAndSelect(e.dataTransfer.files[0] ?? null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  async function handleUpload() {
    if (!selectedFile || isLoading) return;
    await upload(selectedFile);
    if (state.status !== 'error') setSelectedFile(null);
  }

  return (
    <div className="p-6 md:p-10 ">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a PDF to the knowledge base. Text is extracted, chunked, and embedded automatically.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">

        {/* ── Dropzone ────────────────────────────────────────────────────── */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setDragOver(false)}
          onClick={() => !isLoading && fileInputRef.current?.click()}
          className={`
            flex flex-col items-center justify-center w-full h-44 border-2 border-dashed
            rounded-xl cursor-pointer transition-all select-none
            ${isLoading ? 'opacity-60 pointer-events-none' : ''}
            ${dragOver
              ? 'border-indigo-400 bg-indigo-50 scale-[1.01]'
              : selectedFile
                ? 'border-indigo-300 bg-indigo-50'
                : 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isLoading}
          />

          {selectedFile ? (
            <div className="flex flex-col items-center gap-2 text-center px-6">
              <FileIcon className="w-9 h-9 text-indigo-500" />
              <p className="text-sm font-semibold text-indigo-700 truncate max-w-xs">{selectedFile.name}</p>
              <p className="text-xs text-indigo-400">{formatBytes(selectedFile.size)}</p>
              {!isLoading && (
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); reset(); }}
                  className="text-xs text-gray-400 hover:text-gray-600 mt-1"
                >
                  Remove
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center px-6">
              <UploadCloudIcon className="w-9 h-9 text-gray-300" />
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-indigo-600">Click to browse</span> or drag & drop
              </p>
              <p className="text-xs text-gray-400">PDF only · max 20 MB</p>
            </div>
          )}
        </div>

        {/* ── Upload button ────────────────────────────────────────────────── */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isLoading}
          className={`
            w-full py-3 px-6 rounded-xl text-sm font-semibold transition-all
            ${!selectedFile || isLoading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[.98] shadow-sm'
            }
          `}
        >
          {isLoading
            ? <span className="flex items-center justify-center gap-2"><Spinner />Processing — this may take a moment…</span>
            : 'Upload & Process'
          }
        </button>

        {/* ── Success ──────────────────────────────────────────────────────── */}
        {state.status === 'success' && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-5">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-800">Uploaded and processed</p>
                <ul className="mt-2 space-y-1 text-xs text-green-700">
                  <li><span className="font-medium">Title:</span> {state.data.title}</li>
                  <li><span className="font-medium">Document ID:</span> <span className="font-mono">{state.data.documentId}</span></li>
                  <li><span className="font-medium">Text extracted:</span> {state.data.extractedTextLength.toLocaleString()} characters</li>
                </ul>
                <div className="mt-4 flex gap-3">
                  <Link
                    href={`/admin/documents/${state.data.documentId}`}
                    className="text-xs font-semibold text-green-800 underline underline-offset-2 hover:text-green-900"
                  >
                    View document →
                  </Link>
                  <button
                    onClick={() => { reset(); setSelectedFile(null); }}
                    className="text-xs font-medium text-green-700 hover:text-green-800"
                  >
                    Upload another
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Error ────────────────────────────────────────────────────────── */}
        {state.status === 'error' && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-5">
            <p className="text-sm font-semibold text-red-800">Upload failed</p>
            <p className="mt-1 text-xs text-red-600">{state.message}</p>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

// ─── Icons ─────────────────────────────────────────────────────────────────

function UploadCloudIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
