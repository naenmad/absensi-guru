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
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
        isActive
          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
      }`}
    >
      <div className={isActive ? 'text-white' : 'text-slate-400'}>{children}</div>
      <span>{label}</span>
    </Link>
  );
}
