// src/components/VoucherSelector.tsx

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Tag, X, Check, Search, Percent, DollarSign,
  ChevronDown, ChevronUp, AlertCircle, Plus,
  RefreshCw, ExternalLink, CheckCircle2, Calendar, Zap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { agentVoucherService, Voucher, CreateVoucherPayload } from '../services/voucherService';
import { useLangNavigate } from '@/src/hooks/useLangNavigate';

interface VoucherSelectorProps {
  selectedIds: number[];
  onChange:    (ids: number[]) => void;
}

const formatRp = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`;

// ── VoucherBadge ─────────────────────────────────────────────────────────────
const VoucherBadge: React.FC<{ voucher: Voucher; onRemove: () => void }> = ({ voucher, onRemove }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-xl text-xs font-bold text-orange-700">
    {voucher.type === 'percent'
      ? <Percent className="w-3 h-3 shrink-0" />
      : <DollarSign className="w-3 h-3 shrink-0" />
    }
    <span className="max-w-[120px] truncate font-mono tracking-wide">{voucher.code}</span>
    <span className="font-normal text-orange-400">
      {voucher.type === 'percent' ? `${voucher.value}%` : formatRp(voucher.value)}
    </span>
    <button type="button" onClick={onRemove} className="ml-1 text-gray-300 hover:text-red-500 transition-colors">
      <X className="w-3 h-3" />
    </button>
  </div>
);

interface QuickFormData {
  code: string; description: string; type: 'percent' | 'fixed';
  value: string; min_transaction: string; expires_at: string; max_usage: string;
}
const EMPTY_QUICK: QuickFormData = {
  code: '', description: '', type: 'percent',
  value: '', min_transaction: '', expires_at: '', max_usage: '',
};

// ── Main Component ────────────────────────────────────────────────────────────
const VoucherSelector: React.FC<VoucherSelectorProps> = ({ selectedIds, onChange }) => {
  const { t } = useTranslation();
  const { langNavigate } = useLangNavigate();

  const [vouchers, setVouchers]         = useState<Voucher[]>([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [isOpen, setIsOpen]             = useState(false);
  const [search, setSearch]             = useState('');
  const [showQuick, setShowQuick]       = useState(false);
  const [quickForm, setQuickForm]       = useState<QuickFormData>(EMPTY_QUICK);
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickErrors, setQuickErrors]   = useState<Partial<QuickFormData>>({});
  const [quickSuccess, setQuickSuccess] = useState<string | null>(null);

  const fetchingRef = useRef(false);

  const loadVouchers = async (force = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const data = await agentVoucherService.list();
      setVouchers(data.vouchers ?? []);
    } catch {
      setError(t('voucher_selector.error_load'));
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (selectedIds.length > 0 || isOpen) {
      if (vouchers.length === 0 && !isLoading) loadVouchers();
    }
  }, [isOpen, selectedIds.length]);

  const selectedVouchers = vouchers.filter(v => selectedIds.includes(Number(v.id)));

  const filteredVouchers = vouchers.filter(v => {
    const q = search.toLowerCase();
    return v.code.toLowerCase().includes(q) || (v.description ?? '').toLowerCase().includes(q);
  });

  const toggle = useCallback((id: number) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter(x => x !== id)
        : [...selectedIds, id]
    );
  }, [selectedIds, onChange]);

  const isExpired = (v: Voucher) =>
    v.expires_at ? new Date(v.expires_at) < new Date() : false;

  const isFull = (v: Voucher) =>
    v.max_usage != null && Number(v.used_count) >= Number(v.max_usage);

  // ── Quick Create validation ───────────────────────────────────────────────
  const validateQuick = () => {
    const e: Partial<QuickFormData> = {};
    if (!quickForm.code.trim())
      e.code = t('voucher_selector.quick_err_code_required');
    else if (!/^[A-Z0-9_-]+$/i.test(quickForm.code))
      e.code = t('voucher_selector.quick_err_code_format');
    if (!quickForm.value || Number(quickForm.value) <= 0)
      e.value = t('voucher_selector.quick_err_value_positive');
    else if (quickForm.type === 'percent' && Number(quickForm.value) > 100)
      e.value = t('voucher_selector.quick_err_value_max_percent');
    setQuickErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleQuickCreate = async () => {
    if (!validateQuick()) return;
    setQuickLoading(true);
    setQuickSuccess(null);
    try {
      const created = await agentVoucherService.create({
        code:            quickForm.code.toUpperCase().trim(),
        description:     quickForm.description || null,
        type:            quickForm.type,
        value:           Number(quickForm.value),
        min_transaction: quickForm.min_transaction ? Number(quickForm.min_transaction) : 0,
        max_usage:       quickForm.max_usage ? Number(quickForm.max_usage) : null,
        starts_at:       null,
        expires_at:      quickForm.expires_at || null,
        is_active:       1,
      } as CreateVoucherPayload);

      setVouchers(prev => [created, ...prev]);
      onChange([...selectedIds, Number(created.id)]);
      setQuickSuccess(t('voucher_selector.quick_success', { code: created.code }));
      setQuickForm(EMPTY_QUICK);
      setQuickErrors({});
      setTimeout(() => { setShowQuick(false); setQuickSuccess(null); }, 1500);
    } catch (e: any) {
      setQuickErrors({ code: e?.response?.data?.message || t('voucher_selector.quick_err_create_failed') });
    } finally {
      setQuickLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-orange-300 hover:shadow-sm transition-all text-sm font-bold text-gray-700 group"
      >
        <span className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-orange-500" />
          {t('voucher_selector.toggle_label')}
          {selectedIds.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 bg-orange-500 text-white text-[10px] font-extrabold rounded-full">
              {selectedIds.length}
            </span>
          )}
        </span>
        {isOpen
          ? <ChevronUp   className="w-4 h-4 text-gray-400 group-hover:text-orange-500" />
          : <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-orange-500" />
        }
      </button>

      {/* Selected voucher badges */}
      {selectedVouchers.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {selectedVouchers.map(v => (
            <VoucherBadge key={v.id} voucher={v} onRemove={() => toggle(Number(v.id))} />
          ))}
        </div>
      )}

      {/* Dropdown panel */}
      {isOpen && (
        <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-lg bg-white">

          {/* Search + actions */}
          <div className="p-3 border-b border-gray-100 bg-gray-50 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('voucher_selector.search_placeholder')}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {!showQuick && (
              <button
                type="button"
                onClick={() => setShowQuick(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> {t('voucher_selector.btn_create')}
              </button>
            )}
            <button
              type="button"
              onClick={() => loadVouchers(true)}
              title={t('voucher_selector.btn_refresh')}
              className="p-2.5 rounded-xl border border-gray-200 hover:bg-white transition-all shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Quick Create form */}
          {showQuick && (
            <div className="p-4 border-b border-orange-100 bg-orange-50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-orange-700 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> {t('voucher_selector.quick_title')}
                </p>
                <button
                  type="button"
                  onClick={() => { setShowQuick(false); setQuickErrors({}); setQuickForm(EMPTY_QUICK); }}
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              {quickSuccess && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <p className="text-xs font-semibold text-green-700">{quickSuccess}</p>
                </div>
              )}

              <div className="space-y-3">
                {/* Code + Type */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      {t('voucher_selector.quick_label_code')} *
                    </label>
                    <input
                      type="text"
                      value={quickForm.code}
                      onChange={e => setQuickForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                      placeholder="PROMO10"
                      className={`w-full px-3 py-2 rounded-lg border text-xs font-mono font-bold tracking-widest focus:outline-none
                        ${quickErrors.code ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white focus:border-orange-400'}`}
                    />
                    {quickErrors.code && (
                      <p className="text-red-500 text-[10px] mt-0.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />{quickErrors.code}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      {t('voucher_selector.quick_label_type')}
                    </label>
                    <select
                      value={quickForm.type}
                      onChange={e => setQuickForm(f => ({ ...f, type: e.target.value as 'percent' | 'fixed' }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:border-orange-400"
                    >
                      <option value="percent">{t('voucher_selector.quick_type_percent')}</option>
                      <option value="fixed">{t('voucher_selector.quick_type_fixed')}</option>
                    </select>
                  </div>
                </div>

                {/* Value + Min transaction */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      {t('voucher_selector.quick_label_value')} *
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">
                        {quickForm.type === 'percent' ? '%' : 'Rp'}
                      </span>
                      <input
                        type="number"
                        value={quickForm.value}
                        onChange={e => setQuickForm(f => ({ ...f, value: e.target.value }))}
                        placeholder={quickForm.type === 'percent' ? '10' : '50000'}
                        className={`w-full pl-7 pr-2 py-2 rounded-lg border text-xs focus:outline-none
                          ${quickErrors.value ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white focus:border-orange-400'}`}
                      />
                    </div>
                    {quickErrors.value && (
                      <p className="text-red-500 text-[10px] mt-0.5">{quickErrors.value}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      {t('voucher_selector.quick_label_min_transaction')}
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">Rp</span>
                      <input
                        type="number"
                        value={quickForm.min_transaction}
                        onChange={e => setQuickForm(f => ({ ...f, min_transaction: e.target.value }))}
                        placeholder="0"
                        className="w-full pl-7 pr-2 py-2 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:border-orange-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                    {t('voucher_selector.quick_label_description')}
                  </label>
                  <input
                    type="text"
                    value={quickForm.description}
                    onChange={e => setQuickForm(f => ({ ...f, description: e.target.value }))}
                    placeholder={t('voucher_selector.quick_desc_placeholder')}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:border-orange-400"
                  />
                </div>

                {/* Expiry + Max usage */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {t('voucher_selector.quick_label_expires')}
                    </label>
                    <input
                      type="datetime-local"
                      value={quickForm.expires_at}
                      onChange={e => setQuickForm(f => ({ ...f, expires_at: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:border-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      {t('voucher_selector.quick_label_max_usage')}
                    </label>
                    <input
                      type="number"
                      value={quickForm.max_usage}
                      onChange={e => setQuickForm(f => ({ ...f, max_usage: e.target.value }))}
                      placeholder="∞"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:border-orange-400"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleQuickCreate}
                    disabled={quickLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold disabled:opacity-60"
                  >
                    {quickLoading
                      ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> {t('voucher_selector.quick_btn_saving')}</>
                      : <><CheckCircle2 className="w-3.5 h-3.5" /> {t('voucher_selector.quick_btn_create_select')}</>
                    }
                  </button>
                  <button
                    type="button"
                    onClick={() => langNavigate('/agent/vouchers')}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:text-primary-600 hover:border-primary-300 text-xs font-semibold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> {t('voucher_selector.btn_manage')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Voucher list */}
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
                <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mr-2" />
                {t('voucher_selector.loading')}
              </div>
            )}

            {/* Error */}
            {error && !isLoading && (
              <div className="flex flex-col items-center gap-2 p-6 text-center">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-sm text-red-500">{error}</p>
                <button
                  type="button"
                  onClick={() => loadVouchers(true)}
                  className="text-xs font-bold text-orange-600 hover:underline mt-1"
                >
                  {t('voucher_selector.btn_retry')}
                </button>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && filteredVouchers.length === 0 && !showQuick && (
              <div className="py-10 px-6 text-center">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Tag className="w-6 h-6 text-orange-200" />
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  {search ? t('voucher_selector.empty_no_match') : t('voucher_selector.empty_no_vouchers')}
                </p>
                {!search && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowQuick(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" /> {t('voucher_selector.btn_create_now')}
                    </button>
                    <button
                      type="button"
                      onClick={() => langNavigate('/agent/vouchers')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600 text-xs font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> {t('voucher_selector.btn_voucher_page')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Voucher rows */}
            {!isLoading && !error && filteredVouchers.map(v => {
              const isSelected = selectedIds.includes(Number(v.id));
              const expired    = isExpired(v);
              const full       = isFull(v);
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => toggle(Number(v.id))}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all
                    ${isSelected ? 'bg-orange-50 hover:bg-orange-100' : 'hover:bg-gray-50'}`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0
                    ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-gray-900 font-mono tracking-wide">{v.code}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                        ${v.type === 'percent' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {v.type === 'percent' ? `${v.value}% off` : `${formatRp(Number(v.value))} off`}
                      </span>
                      {/* Status badges */}
                      {!v.is_active && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">
                          {t('voucher_selector.status_inactive')}
                        </span>
                      )}
                      {v.is_active && expired && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
                          {t('voucher_selector.status_expired')}
                        </span>
                      )}
                      {v.is_active && !expired && full && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-600">
                          {t('voucher_selector.status_quota_full')}
                        </span>
                      )}
                      {v.is_active && !expired && !full && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                          {t('voucher_selector.status_active')}
                        </span>
                      )}
                    </div>
                    {v.description && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{v.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-gray-400">
                        {t('voucher_selector.row_min', { amount: formatRp(Number(v.min_transaction)) })}
                      </span>
                      {v.expires_at && (
                        <span className="text-[10px] text-gray-400">
                          {t('voucher_selector.row_until')}{' '}
                          {new Date(v.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      {v.max_usage != null && (
                        <span className="text-[10px] text-gray-400">
                          {t('voucher_selector.row_used', { used: v.used_count, max: v.max_usage })}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {t('voucher_selector.footer_selected', { count: selectedIds.length })}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-orange-600 hover:underline"
            >
              {t('voucher_selector.btn_done')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherSelector;
