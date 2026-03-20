// components/SearchableSelect.tsx
// Generic searchable dropdown — dapat dipakai untuk pilih produk, mobil, atau data lainnya.

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, CheckCircle2 } from 'lucide-react';

export interface SearchableSelectOption {
  value:       number | string;
  label:       string;        // Teks utama yang ditampilkan
  sublabel?:   string;        // Teks kecil di bawah label (harga, lokasi, dll)
  image?:      string | null; // URL gambar thumbnail opsional
  disabled?:   boolean;       // Apakah option ini bisa dipilih
  badge?:      string | null; // Badge kecil (misal: "Pending", "Flash Sale Aktif")
  badgeColor?: 'orange' | 'green' | 'red' | 'gray'; // Warna badge
}

interface Props {
  options:      SearchableSelectOption[];
  value:        number | string | null | undefined;
  onChange:     (value: number | string | '') => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?:    boolean;
  className?:   string;
}

const BADGE_COLORS: Record<string, string> = {
  orange: 'bg-orange-100 text-orange-600',
  green:  'bg-green-100 text-green-600',
  red:    'bg-red-100 text-red-600',
  gray:   'bg-gray-100 text-gray-500',
};

const SearchableSelect: React.FC<Props> = ({
  options,
  value,
  onChange,
  placeholder = '-- Pilih --',
  searchPlaceholder = 'Cari...',
  disabled = false,
  className = '',
}) => {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef        = useRef<HTMLDivElement>(null);
  const inputRef          = useRef<HTMLInputElement>(null);

  const selected = options.find(o => String(o.value) === String(value)) ?? null;

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-fokus search input saat buka
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter(o =>
      o.label.toLowerCase().includes(q) ||
      (o.sublabel ?? '').toLowerCase().includes(q)
    );
  }, [options, query]);

  const handleSelect = (opt: SearchableSelectOption) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
    setQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
  };

  const handleToggle = () => {
    if (disabled) return;
    setOpen(o => !o);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* ── Trigger button ── */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none
          ${disabled
            ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
            : open
              ? 'border-primary-500 ring-2 ring-primary-500/20 bg-white'
              : 'border-gray-200 bg-gray-50 hover:border-gray-300 cursor-pointer'
          }`}
      >
        {selected ? (
          <div className="flex items-center gap-2.5 min-w-0">
            {selected.image && (
              <img
                src={selected.image}
                alt=""
                className="w-8 h-8 rounded-lg object-cover shrink-0"
              />
            )}
            <div className="min-w-0 text-left">
              <p className="font-bold text-gray-900 truncate text-sm">{selected.label}</p>
              {selected.sublabel && (
                <p className="text-xs text-gray-400 truncate">{selected.sublabel}</p>
              )}
            </div>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">{placeholder}</span>
        )}

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {selected && !disabled && (
            <span
              onClick={handleClear}
              className="w-5 h-5 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-400 transition-colors cursor-pointer text-xs font-bold leading-none"
            >
              ×
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold leading-none"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Options */}
          <ul className="max-h-60 overflow-y-auto py-1.5">
            {filtered.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-gray-400">
                Tidak ada hasil ditemukan
              </li>
            ) : (
              filtered.map(opt => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => handleSelect(opt)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                        ${isSelected
                          ? 'bg-primary-50 text-primary-700'
                          : opt.disabled
                            ? 'opacity-50 cursor-not-allowed bg-gray-50'
                            : 'hover:bg-gray-50 text-gray-800'
                        }`}
                    >
                      {opt.image && (
                        <img
                          src={opt.image}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{opt.label}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {opt.sublabel && (
                            <p className="text-xs text-gray-400 truncate">{opt.sublabel}</p>
                          )}
                          {opt.badge && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${BADGE_COLORS[opt.badgeColor ?? 'gray']}`}>
                              {opt.badge}
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-primary-500 shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {/* Footer count saat ada query */}
          {query && filtered.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400">
              {filtered.length} hasil ditemukan
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
export type { Props as SearchableSelectProps };
