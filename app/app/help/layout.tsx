'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function HelpLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isMainHelpPage = pathname === '/help';
  const backHref = isMainHelpPage ? '/' : '/help';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="w-full px-6 py-4 shadow flex justify-between items-center bg-white">
        <Link href={backHref} className="text-lg font-medium text-blue-600 hover:underline">
          ← Back
        </Link>
        <Link
          href="/login"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Login
        </Link>
      </header>

      <main className="p-6">{children}</main>
    </div>
  );
}