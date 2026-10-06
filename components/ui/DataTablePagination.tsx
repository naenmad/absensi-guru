'use client';

import React, { useMemo, useState } from 'react';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
} from 'lucide-react';

export interface UseDataTableOptions<T> {
  data: T[];
  searchFields?: ((item: T) => string | null | undefined)[];
  searchFilter?: (item: T, query: string) => boolean;
  initialPageSize?: number;
}

export function useDataTable<T>({
  data,
  searchFields,
  searchFilter,
  initialPageSize = 10,
}: UseDataTableOptions<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Filter berdasarkan search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase().trim();
    if (searchFilter) {
      return data.filter((item) => searchFilter(item, query));
    }

    return data.filter((item) => {
      if (!searchFields || searchFields.length === 0) {
        // Default: stringify all object values
        return JSON.stringify(item).toLowerCase().includes(query);
      }
      return searchFields.some((getField) => {
        const val = getField(item);
        return val ? String(val).toLowerCase().includes(query) : false;
      });
    });
  }, [data, searchQuery, searchFields, searchFilter]);

  // Total halaman
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  // Pastikan currentPage selalu dalam rentang valid
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  // Data terpaginasi
  const paginatedData = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, safeCurrentPage, pageSize]);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1); // Reset ke halaman 1 saat mencari
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return {
    searchQuery,
    setSearchQuery: handleSearchChange,
    currentPage: safeCurrentPage,
    setCurrentPage,
    pageSize,
    setPageSize: handlePageSizeChange,
    filteredData,
    paginatedData,
    totalItems: data.length,
    filteredCount: filteredData.length,
    totalPages,
    startIndex: (safeCurrentPage - 1) * pageSize + (filteredData.length > 0 ? 1 : 0),
    endIndex: Math.min(safeCurrentPage * pageSize, filteredData.length),
  };
}

interface DataTableControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  children?: React.ReactNode; // Tempat filter tambahan (cth: select hari, select role)
}

export function DataTableControls({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Cari data...',
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  children,
}: DataTableControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#3a4a83] focus:ring-1 focus:ring-[#3a4a83] transition"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            title="Hapus pencarian"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Slot & Rows Per Page */}
      <div className="flex items-center gap-2.5 flex-wrap justify-between sm:justify-end">
        {children}

        {/* Page size dropdown */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 shrink-0">
          <span className="text-[11px] text-slate-500 hidden sm:inline">Tampilkan:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:border-[#3a4a83] cursor-pointer"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} baris
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  startIndex: number;
  endIndex: number;
  totalFiltered: number;
  totalAll: number;
}

export function DataTablePagination({
  currentPage,
  totalPages,
  onPageChange,
  startIndex,
  endIndex,
  totalFiltered,
  totalAll,
}: DataTablePaginationProps) {
  // Generate rentang nomor halaman yang cerdas (cth: 1, 2, 3 ... 10)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3.5 px-2 border-t border-slate-200/80 text-xs text-slate-600">
      {/* Keterangan Counter */}
      <div className="text-[11px] text-slate-500 text-center sm:text-left">
        Menampilkan <span className="font-semibold text-slate-800">{startIndex}</span>–
        <span className="font-semibold text-slate-800">{endIndex}</span> dari{' '}
        <span className="font-semibold text-slate-800">{totalFiltered}</span> data
        {totalFiltered !== totalAll && (
          <span className="text-slate-400"> (disaring dari {totalAll} total)</span>
        )}
      </div>

      {/* Kontrol Navigasi Halaman */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition cursor-pointer"
          title="Halaman Pertama"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition cursor-pointer"
          title="Halaman Sebelumnya"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1 px-1">
          {getPageNumbers().map((p, idx) =>
            typeof p === 'number' ? (
              <button
                key={idx}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-[28px] h-7 px-2 rounded-md text-xs font-semibold transition cursor-pointer ${
                  currentPage === p
                    ? 'bg-[#3a4a83] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ) : (
              <span key={idx} className="px-1 text-slate-400">
                {p}
              </span>
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition cursor-pointer"
          title="Halaman Selanjutnya"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition cursor-pointer"
          title="Halaman Terakhir"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
