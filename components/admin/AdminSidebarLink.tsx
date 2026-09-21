'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminSidebarLinkProps {
  href: string;
  label: string;
  children: React.ReactNode;
}

export default function AdminSidebarLink({ href, label, children }: AdminSidebarLinkProps) {
  const pathname = usePathname();
  const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition ${
        isActive
          ? 'bg-slate-800 text-white font-semibold'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 font-medium'
      }`}
    >
      <div className={isActive ? 'text-sky-400' : 'text-slate-500'}>{children}</div>
      <span className="truncate">{label}</span>
    </Link>
  );
}
