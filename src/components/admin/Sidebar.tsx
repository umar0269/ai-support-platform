'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  label: string;
  href: string;
  icon: React.FC<{ className?: string }>;
  disabled?: boolean;
};

const NAV: NavItem[] = [
  { label: 'Documents', href: '/admin/documents', icon: DocumentsIcon },
  { label: 'Upload',    href: '/admin/upload',    icon: UploadIcon },
  { label: 'Tickets',   href: '/admin/tickets',   icon: TicketIcon },
  { label: 'Analytics', href: '/admin/analytics', icon: ChartIcon, disabled: true },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 flex-none flex-col bg-white border-r border-gray-200">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-gray-100">
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Admin</p>
        <p className="mt-0.5 text-sm font-bold text-gray-900">AI Support Platform</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          const base =
            'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors';

          if (item.disabled) {
            return (
              <span
                key={item.href}
                className={`${base} text-gray-300 cursor-not-allowed`}
                title="Coming soon"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                <span className="ml-auto text-[10px] font-normal text-gray-300">soon</span>
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${base} ${
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">Phase 5 · Admin</p>
      </div>
    </aside>
  );
}

// ─── Mobile top-bar (shown below md) ──────────────────────────────────────

export function MobileNav() {
  const pathname = usePathname();

  return (
    <header className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
      <p className="text-sm font-bold text-gray-900">AI Support</p>
      <nav className="flex items-center gap-1">
        {NAV.filter((i) => !i.disabled).map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

// ─── Icons ─────────────────────────────────────────────────────────────────

function DocumentsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function TicketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}
