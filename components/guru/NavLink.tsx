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
        className="flex flex-col items-center justify-center py-1.5 px-3 rounded-lg transition"
      >
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
            isActive
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {children}
        </div>
        <span
          className={`text-[10px] font-medium mt-1 ${
            isActive ? 'text-slate-900 font-semibold' : 'text-slate-500'
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
      className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg transition ${
        isActive
          ? 'text-slate-900 font-semibold'
          : 'text-slate-500 hover:text-slate-900'
      }`}
    >
      <div className="w-9 h-9 flex items-center justify-center mb-0.5">{children}</div>
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </Link>
  );
}
