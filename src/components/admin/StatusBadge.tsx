import type { DocumentStatus } from '@/types';

const STYLES: Record<DocumentStatus, string> = {
  pending:    'bg-gray-100 text-gray-600',
  processing: 'bg-amber-100 text-amber-700',
  processed:  'bg-green-100 text-green-700',
  failed:     'bg-red-100 text-red-700',
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
