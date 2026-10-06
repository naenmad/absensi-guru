'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminSidebarLinkProps {
  href: string;
  label: string;
  children: React.ReactNode;
  isCollapsed?: boolean;
  onClick?: () => void;
}

export default function AdminSidebarLink({
  href,
  label,
  children,
  isCollapsed = false,
  onClick,
}: AdminSidebarLinkProps) {
  const pathname = usePathname();
  const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={`flex items-center gap-2.5 rounded-lg text-xs transition group relative ${
        isCollapsed ? 'justify-center py-2.5 px-0' : 'px-3 py-2'
      } ${
        isActive
          ? 'bg-[#3a4a83] text-white font-semibold shadow-xs'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 font-medium'
      }`}
    >
      <div className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
        {children}
      </div>
      {!isCollapsed && <span className="truncate">{label}</span>}

      {/* Floating tooltip on hover when collapsed */}
      {isCollapsed && (
        <span className="absolute left-full ml-2.5 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-md border border-slate-700">
          {label}
        </span>
      )}
    </Link>
  );
}

