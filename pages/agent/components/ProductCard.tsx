import { Edit3, Eye, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import React, { useMemo } from 'react';
import type { AgentProduct } from '../../../types';

type Props = {
  product: AgentProduct;
  onToggleStatus: () => void;
  onDelete: () => void;
  onJoinFlashSale: () => void;
  onNavigateEdit: () => void;
};

const FALLBACK =
  'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80';

const ProductCard: React.FC<Props> = ({
  product,
  onToggleStatus,
  onDelete,
  onJoinFlashSale,
  onNavigateEdit,
}) => {
  // sesuai interface: AgentProductImage[]
  const images = useMemo(
    () => (Array.isArray(product.images) ? product.images : []),
    [product.images],
  );

  const cover = product.image;

  // thumbs ambil setelah cover biar gak dobel
  const thumbs = images.slice(1, 5); // max 4 thumbs
  const extraCount = Math.max(0, images.length - 1);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex gap-4 p-4">
        {/* Cover */}
        <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-gray-100">
          <img
            src={cover}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK;
            }}
          />

          {/* Badge +N */}
          {extraCount > 0 && (
            <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg text-xs font-bold bg-black/60 text-white">
              +{extraCount}
            </div>
          )}

          {/* Status pill */}
          <div className="absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-bold bg-white/80 text-gray-800">
            {product.is_active ? 'ACTIVE' : 'INACTIVE'}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-extrabold text-gray-900 truncate">{product.name}</h3>
              <p className="text-sm text-gray-500 truncate">{product.location || '-'}</p>
            </div>

            <div className="text-right">
              <div className="text-sm font-extrabold text-gray-900">
                {product.currency} {Number(product.price || 0).toLocaleString()}
              </div>
              {product.rating ? (
                <div className="text-xs text-gray-500">⭐ {product.rating}</div>
              ) : null}
            </div>
          </div>

          {/* Mini thumbnails */}
          {thumbs.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              {thumbs.map((img, idx) => (
                <div
                  key={img.id ?? `${img.url}-${idx}`}
                  className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100"
                >
                  <img
                    src={img.url}
                    alt={`thumb-${idx}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = FALLBACK;
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={onNavigateEdit}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800"
            >
              <Edit3 className="w-4 h-4" /> Edit
            </button>

            <button
              onClick={onToggleStatus}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 text-gray-900 text-sm font-bold hover:bg-gray-200"
            >
              {product.is_active ? (
                <>
                  <ToggleRight className="w-4 h-4" /> Disable
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4" /> Enable
                </>
              )}
            </button>

            <button
              onClick={onJoinFlashSale}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700"
            >
              <Eye className="w-4 h-4" /> Flash Sale
            </button>

            <button
              onClick={onDelete}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 text-red-700 text-sm font-bold hover:bg-red-100"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
