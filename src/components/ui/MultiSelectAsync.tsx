import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '../utils/cn';
import { Loader } from './Loader';

export interface MultiSelectAsyncOption {
  value: number;
  label: string;
}

export type LoadOptionsFn = (
  page: number,
  search: string
) => Promise<{ options: MultiSelectAsyncOption[]; hasMore: boolean }>;

interface MultiSelectAsyncProps {
  label?: string;
  value: number[];
  onChange: (value: number[]) => void;
  loadOptions: LoadOptionsFn;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  maxHeight?: number;
  countLabel?: string;
  searchPlaceholder?: string;
}

export const MultiSelectAsync: React.FC<MultiSelectAsyncProps> = ({
  label,
  value,
  onChange,
  loadOptions,
  placeholder = 'Select...',
  disabled,
  className,
  required,
  maxHeight = 200,
  countLabel = 'items',
  searchPlaceholder = 'Search...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<{ top: number; left: number; minWidth: number } | null>(null);
  const [options, setOptions] = useState<MultiSelectAsyncOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadOptionsRef = useRef(loadOptions);
  const lastQueryRef = useRef<{ page: number; search: string } | null>(null);

  const loadPage = useCallback(
    async (pageNum: number, searchTerm: string, append: boolean) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const res = await loadOptions(pageNum, searchTerm);
        setOptions((prev) => (append ? [...prev, ...res.options] : res.options));
        setHasMore(res.hasMore);
        lastQueryRef.current = { page: pageNum, search: searchTerm };
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [loadOptions]
  );

  useEffect(() => {
    if (loadOptionsRef.current !== loadOptions) {
      loadOptionsRef.current = loadOptions;
      setOptions([]);
      lastQueryRef.current = null;
    }
  }, [loadOptions]);

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setSearch('');
      const cachedForQuery = lastQueryRef.current?.page === 1 && lastQueryRef.current?.search === '';
      if (!cachedForQuery || options.length === 0) {
        loadPage(1, '', false);
      }
    }
  }, [isOpen, loadPage]);

  useEffect(() => {
    if (!isOpen) return;
    const t = searchDebounceRef.current;
    if (t) clearTimeout(t);
    searchDebounceRef.current = setTimeout(() => {
      setPage(1);
      loadPage(1, search, false);
      searchDebounceRef.current = null;
    }, 250);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [search, isOpen]);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || loadingMore || !hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollTop + clientHeight >= scrollHeight - 40) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPage(nextPage, search, true);
    }
  }, [page, search, loadPage, loadingMore, hasMore, loading]);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + 4,
        left: rect.left,
        minWidth: Math.max(rect.width, 280),
      });
    } else {
      setDropdownStyle(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        selectRef.current &&
        !selectRef.current.contains(target) &&
        !(target as Element).closest?.('[data-multiselect-async-dropdown]')
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const selectedSet = new Set(value);
  const displayText =
    value.length === 0
      ? placeholder
      : value.length === 1
        ? options.find((o) => o.value === value[0])?.label ?? `${value.length} selected`
        : `${value.length} ${countLabel} selected`;

  const toggleOption = (optValue: number) => {
    const next = new Set(value);
    if (next.has(optValue)) next.delete(optValue);
    else next.add(optValue);
    onChange([...next]);
  };

  const selectId = `multiselect-async-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-[#F27A1A] ml-1">*</span>}
        </label>
      )}
      <div ref={selectRef} className="relative">
        <button
          ref={triggerRef}
          type="button"
          id={selectId}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'w-full min-w-0 h-11 px-4 rounded-lg border transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-1 focus:border-[var(--brand)]',
            'border-[var(--border)] hover:border-gray-300',
            'disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500',
            'text-sm text-left flex items-center justify-between gap-2 bg-white',
            isOpen && 'border-[var(--brand)] ring-2 ring-[var(--brand)] ring-offset-1'
          )}
        >
          <span
            className={cn('min-w-0 truncate', value.length ? 'text-gray-900' : 'text-gray-400')}
            title={displayText}
          >
            {displayText}
          </span>
          <ChevronDown
            className={cn('w-5 h-5 shrink-0 text-gray-400 transition-transform duration-200', isOpen && 'rotate-180')}
          />
        </button>

        {isOpen &&
          dropdownStyle &&
          typeof document !== 'undefined' &&
          createPortal(
            <div
              data-multiselect-async-dropdown
              className="fixed z-[9999] bg-white border-2 border-gray-200 rounded-lg shadow-lg overflow-hidden flex flex-col"
              style={{
                top: dropdownStyle.top,
                left: dropdownStyle.left,
                minWidth: dropdownStyle.minWidth,
              }}
            >
              <div className="p-2 border-b border-gray-100">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--brand)] focus:border-[var(--brand)]"
                  autoFocus
                />
              </div>
              <div className="overflow-y-auto py-1" ref={listRef} onScroll={handleScroll} style={{ maxHeight }}>
                {loading && options.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <Loader variant="dots" size="sm" message="Loading..." />
                  </div>
                ) : options.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-gray-500 text-center">No options found</div>
                ) : (
                  <>
                    {options.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSet.has(opt.value)}
                          onChange={() => toggleOption(opt.value)}
                          className="w-4 h-4 rounded border-gray-300 text-[var(--brand)] focus:ring-[var(--brand)]"
                        />
                        <span className="text-sm text-gray-900 truncate" title={opt.label}>
                          {opt.label}
                        </span>
                      </label>
                    ))}
                    {loadingMore && (
                      <div className="flex justify-center py-3 border-t border-gray-100">
                        <Loader variant="dots" size="sm" inline />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>,
            document.body
          )}
      </div>
    </div>
  );
};
