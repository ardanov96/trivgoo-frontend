import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLangNavigate } from '../../src/hooks/useLangNavigate';
import {
  CreditCard, Plus, ChevronRight, Shield, Trash2,
  CheckCircle2, Wifi, MoreVertical, Lock,
} from 'lucide-react';

interface SavedCard {
  id: string;
  type: 'visa' | 'mastercard' | 'bca' | 'bni' | 'bri' | 'mandiri';
  last4: string;
  holder: string;
  expiry: string;
  isPrimary: boolean;
  color: string;
}

const MOCK_CARDS: SavedCard[] = [
  { id: '1', type: 'visa',       last4: '4291', holder: 'BUDI SANTOSO', expiry: '08/27', isPrimary: true,  color: 'from-slate-800 to-slate-950' },
  { id: '2', type: 'mastercard', last4: '7734', holder: 'BUDI SANTOSO', expiry: '03/26', isPrimary: false, color: 'from-blue-700 to-blue-950'   },
  { id: '3', type: 'bca',        last4: '0012', holder: 'BUDI SANTOSO', expiry: '12/28', isPrimary: false, color: 'from-blue-500 to-cyan-700'   },
];

const TYPE_LABEL: Record<string, string> = {
  visa: 'VISA', mastercard: 'Mastercard', bca: 'BCA', bni: 'BNI', bri: 'BRI', mandiri: 'Mandiri',
};

// ── Card visual sub-component ────────────────────────────────────────────────
interface CardVisualProps {
  card: SavedCard;
  selected: boolean;
  onClick: () => void;
  labelHolder: string;
  labelExpiry: string;
  labelPrimary: string;
}

const CardVisual: React.FC<CardVisualProps> = ({
  card, selected, onClick, labelHolder, labelExpiry, labelPrimary,
}) => (
  <div
    onClick={onClick}
    className={`relative cursor-pointer rounded-2xl p-5 bg-gradient-to-br ${card.color} text-white overflow-hidden transition-all duration-300 select-none
      ${selected ? 'ring-4 ring-primary-400 ring-offset-2 scale-[1.02] shadow-2xl' : 'hover:scale-[1.01] shadow-lg hover:shadow-xl'}`}
    style={{ aspectRatio: '1.586 / 1' }}
  >
    {/* Decorative circles */}
    <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
    <div className="absolute -bottom-10 -left-6 w-40 h-40 rounded-full bg-white/5" />

    {/* Chip + contactless */}
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className="w-10 h-8 bg-amber-400/80 rounded-md" />
      <Wifi className="w-5 h-5 opacity-70 rotate-90" />
    </div>

    {/* Card number */}
    <p className="text-sm tracking-[0.25em] font-mono opacity-80 mb-1 relative z-10">
      •••• •••• •••• {card.last4}
    </p>

    {/* Bottom row */}
    <div className="flex justify-between items-end mt-3 relative z-10">
      <div>
        <p className="text-[10px] uppercase tracking-wider opacity-60 mb-0.5">{labelHolder}</p>
        <p className="text-sm font-bold tracking-wide truncate max-w-[140px]">{card.holder}</p>
      </div>
      <div className="text-right">
        <p className="text-[10px] uppercase tracking-wider opacity-60 mb-0.5">{labelExpiry}</p>
        <p className="text-sm font-bold">{card.expiry}</p>
      </div>
    </div>

    {/* Card type badge */}
    <div className="absolute top-4 right-4 z-10">
      <span className="text-xs font-black tracking-widest opacity-90 bg-white/10 px-2 py-0.5 rounded">
        {TYPE_LABEL[card.type]}
      </span>
    </div>

    {/* Primary badge */}
    {card.isPrimary && (
      <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" /> {labelPrimary}
      </div>
    )}
  </div>
);

// ── Main component ───────────────────────────────────────────────────────────
const MyCards: React.FC = () => {
  const { langPath } = useLangNavigate();
  const { t } = useTranslation();
  const [cards, setCards]         = useState<SavedCard[]>(MOCK_CARDS);
  const [selectedId, setSelectedId] = useState<string>(MOCK_CARDS[0]?.id ?? '');
  const [showAdd, setShowAdd]     = useState(false);
  const [openMenu, setOpenMenu]   = useState<string | null>(null);

  const selectedCard = cards.find(c => c.id === selectedId);

  const handleSetPrimary = (id: string) => {
    setCards(prev => prev.map(c => ({ ...c, isPrimary: c.id === id })));
    setOpenMenu(null);
  };

  const handleDelete = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
    if (selectedId === id) setSelectedId(cards[0]?.id ?? '');
    setOpenMenu(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link to={langPath('/my-account')} className="hover:text-primary-600 transition-colors">
            {t('cards_page.breadcrumb_account')}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600 font-medium">{t('cards_page.breadcrumb_current')}</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('cards_page.page_title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('cards_page.page_subtitle')}</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-primary-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {t('cards_page.add_button')}
          </button>
        </div>

        {/* Empty state */}
        {cards.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-9 h-9 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">{t('cards_page.empty_title')}</h3>
            <p className="text-sm text-gray-400 mb-6">{t('cards_page.empty_desc')}</p>
            <button
              onClick={() => setShowAdd(true)}
              className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors"
            >
              {t('cards_page.empty_add_button')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Card list */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                {t('cards_page.cards_count', { count: cards.length })}
              </p>
              {cards.map(card => (
                <div key={card.id} className="relative">
                  <CardVisual
                    card={card}
                    selected={selectedId === card.id}
                    onClick={() => setSelectedId(card.id)}
                    labelHolder={t('cards_page.card_holder_label')}
                    labelExpiry={t('cards_page.card_expiry_label')}
                    labelPrimary={t('cards_page.badge_primary')}
                  />

                  {/* Context menu */}
                  <div className="absolute top-3 right-3 z-20">
                    <button
                      onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === card.id ? null : card.id); }}
                      className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-white" />
                    </button>
                    {openMenu === card.id && (
                      <div className="absolute right-0 top-8 bg-white rounded-xl shadow-xl border border-gray-100 py-1 w-44 z-30">
                        {!card.isPrimary && (
                          <button
                            onClick={() => handleSetPrimary(card.id)}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            {t('cards_page.menu_set_primary')}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(card.id)}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          {t('cards_page.menu_delete')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected card detail */}
            {selectedCard && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {t('cards_page.detail_section_label')}
                </p>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                  {[
                    { label: t('cards_page.detail_type'),   value: TYPE_LABEL[selectedCard.type]              },
                    { label: t('cards_page.detail_number'), value: `•••• •••• •••• ${selectedCard.last4}`, mono: true },
                    { label: t('cards_page.detail_holder'), value: selectedCard.holder                        },
                    { label: t('cards_page.detail_expiry'), value: selectedCard.expiry                        },
                  ].map((row, i, arr) => (
                    <div key={row.label} className={`flex justify-between items-center py-3 ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
                      <span className="text-sm text-gray-500">{row.label}</span>
                      <span className={`text-sm font-bold text-gray-900 ${row.mono ? 'font-mono' : ''}`}>{row.value}</span>
                    </div>
                  ))}

                  {/* Status row */}
                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm text-gray-500">{t('cards_page.detail_status')}</span>
                    {selectedCard.isPrimary
                      ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> {t('cards_page.status_primary')}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetPrimary(selectedCard.id)}
                          className="text-xs font-bold text-primary-600 hover:underline"
                        >
                          {t('cards_page.menu_set_primary')}
                        </button>
                      )
                    }
                  </div>
                </div>

                {/* Security note */}
                <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                  <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-blue-800 mb-0.5">{t('cards_page.security_title')}</p>
                    <p className="text-xs text-blue-600 leading-relaxed">{t('cards_page.security_desc')}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(selectedCard.id)}
                  className="flex items-center gap-2 w-full py-3 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl font-bold text-sm transition-colors justify-center"
                >
                  <Trash2 className="w-4 h-4" /> {t('cards_page.delete_button')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Add Card Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 relative">
              <button
                onClick={() => setShowAdd(false)}
                className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{t('cards_page.modal_title')}</h3>
                  <p className="text-xs text-gray-400">{t('cards_page.modal_subtitle')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    {t('cards_page.modal_number_label')}
                  </label>
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="0000 0000 0000 0000"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    {t('cards_page.modal_holder_label')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('cards_page.modal_holder_placeholder')}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      {t('cards_page.modal_expiry_label')}
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      {t('cards_page.modal_cvv_label')}
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-gray-500">{t('cards_page.modal_ssl_note')}</span>
                </div>

                <button
                  onClick={() => setShowAdd(false)}
                  className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md"
                >
                  {t('cards_page.modal_save_button')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCards;
