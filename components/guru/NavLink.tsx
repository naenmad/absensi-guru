'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  label: string;
  children: React.ReactNode;
  highlight?: boolean;
}

export default function NavLink({ href, label, children, highlight }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  if (highlight) {
    return (
      <Link
        href={href}
        className="flex flex-col items-center -mt-5 group"
      >
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105 ${
            isActive
              ? 'bg-blue-600 shadow-blue-500/40 ring-4 ring-blue-100'
              : 'bg-blue-600 shadow-blue-500/25'
          }`}
        >
          {children}
        </div>
        <span
          className={`text-[10px] font-semibold mt-1 ${
            isActive ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          {label}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
        isActive
          ? 'text-blue-600 font-semibold'
          : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <div className="mb-0.5">{children}</div>
      <span className="text-[11px]">{label}</span>
    </Link>
  );
}
