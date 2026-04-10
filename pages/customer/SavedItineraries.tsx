import { BookmarkCheck, Calendar, Link2, MapPin, MoreHorizontal, Plus, Share2, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import SEO from '../../components/SEO';
import { useTranslation } from 'react-i18next';
import { useLangNavigate } from '../../src/hooks/useLangNavigate';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { listSavedItineraries, deleteSavedItinerary, SavedItineraryListItem } from '../../services/aiTripService';
import { useToast } from '../../components/ToastContext';

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function countDays(userStory: string): string {
  const m = userStory.match(/(\d+)\s*(hari|day|malam|night)/i);
  return m ? `${m[1]} hari` : '';
}

// ── Confirm Delete Modal ──────────────────────────────────────────────────────
const ConfirmModal: React.FC<{ onConfirm: () => void; onCancel: () => void }> = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
      className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
        <Trash2 className="w-5 h-5 text-red-600" />
      </div>
      <h3 className="font-bold text-gray-900 text-lg mb-2">Hapus Itinerary?</h3>
      <p className="text-gray-500 text-sm mb-6">Itinerary ini akan dihapus permanen. Link share yang sudah dibagikan tidak akan bisa diakses lagi.</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">Batal</button>
        <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700">Hapus</button>
      </div>
    </motion.div>
  </div>
);

// ── Itinerary Card ────────────────────────────────────────────────────────────
const ItineraryCard: React.FC<{
  item:       SavedItineraryListItem;
  langPath:   (p: string) => string;
  onDelete:   (id: number) => void;
  onCopyLink: (token: string) => void;
}> = ({ item, langPath, onDelete, onCopyLink }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const days = countDays(item.user_story ?? '');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-100 transition-all overflow-hidden"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base line-clamp-1 mb-1">{item.title}</h3>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="w-3 h-3" /> {formatDate(item.created_at)}
              </span>
              {days && (
                <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{days}</span>
              )}
            </div>
          </div>

          {/* Menu */}
          <div className="relative flex-shrink-0">
            <button onClick={() => setMenuOpen(v => !v)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl border border-gray-100 shadow-xl z-40 overflow-hidden">
                    <button onClick={() => { onCopyLink(item.share_token); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-xs font-bold text-gray-600">
                      <Link2 className="w-3.5 h-3.5" /> Salin Link Share
                    </button>
                    <a href={langPath(`/itinerary/share/${item.share_token}`)} target="_blank" rel="noopener noreferrer"
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-xs font-bold text-gray-600 border-t border-gray-50">
                      <Share2 className="w-3.5 h-3.5" /> Lihat Tampilan Share
                    </a>
                    <button onClick={() => { onDelete(item.id); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-50 text-xs font-bold text-red-500 border-t border-gray-50">
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* User story preview */}
        {item.user_story && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{item.user_story}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link to={langPath(`/itinerary/share/${item.share_token}`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:border-primary-300 hover:text-primary-700 transition-colors">
            <BookmarkCheck className="w-3.5 h-3.5" /> Lihat
          </Link>
          <button onClick={() => onCopyLink(item.share_token)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary-600 text-white text-xs font-bold hover:bg-primary-700 transition-colors">
            <Link2 className="w-3.5 h-3.5" /> Bagikan
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const SavedItineraries: React.FC = () => {
  const { t }                = useTranslation();
  const { langPath }         = useLangNavigate();
  const { showToast }        = useToast();

  const [items, setItems]           = useState<SavedItineraryListItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await listSavedItineraries();
        setItems(data);
      } catch {
        showToast('Gagal memuat itinerary.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleDelete = async (id: number) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSavedItinerary(deleteTarget);
      setItems(prev => prev.filter(i => i.id !== deleteTarget));
      showToast('Itinerary dihapus.', 'success');
    } catch {
      showToast('Gagal menghapus itinerary.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}${langPath(`/itinerary/share/${token}`)}`;
    navigator.clipboard.writeText(url);
    showToast('Link berhasil disalin!', 'success');
  };

  return (
    <>
      <SEO title="Itinerary Tersimpan | Trivgoo" noindex />
      <AnimatePresence>{deleteTarget && <ConfirmModal onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />}</AnimatePresence>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Itinerary Tersimpan</h2>
            <p className="text-gray-500 text-sm mt-1">
              {loading ? 'Memuat...' : `${items.length} itinerary tersimpan`}
            </p>
          </div>
          <Link to={langPath('/ai-planner')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors">
            <Plus className="w-4 h-4" /> Buat Baru
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-40 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-2/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/3 mb-4" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <BookmarkCheck className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="font-bold text-gray-700 mb-2">Belum ada itinerary tersimpan</h3>
            <p className="text-gray-400 text-sm mb-6">Buat rencana perjalanan dengan AI Trip Planner dan simpan untuk akses kapan saja.</p>
            <Link to={langPath('/ai-planner')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors">
              <Plus className="w-4 h-4" /> Buat Itinerary Pertamamu
            </Link>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {items.map(item => (
                <ItineraryCard
                  key={item.id}
                  item={item}
                  langPath={langPath}
                  onDelete={handleDelete}
                  onCopyLink={handleCopyLink}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default SavedItineraries;
