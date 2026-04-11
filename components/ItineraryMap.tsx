import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons (Vite/webpack asset issue)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon   from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl:       markerIcon,
  shadowUrl:     markerShadow,
});

// ── Types ─────────────────────────────────────────────────────────────────────
interface Product {
  id:          number;
  name:        string;
  location?:   string;
  lat?:        number | string | null;
  lng?:        number | string | null;
  category_id?: number;
  price?:      number | string;
  currency?:   string;
}

interface ItineraryMapProps {
  products: Product[];
}

// ── Category colors ───────────────────────────────────────────────────────────
function getCategoryColor(catId?: number): string {
  if (catId === 2) return '#a855f7'; // Stay — purple
  if (catId === 3) return '#f59e0b'; // Transport — amber
  return '#ef4444';                  // Tour — red (default)
}

function getCategoryLabel(catId?: number): string {
  if (catId === 2) return 'Stay';
  if (catId === 3) return 'Transport';
  return 'Tour';
}

// ── Custom DivIcon per category ───────────────────────────────────────────────
function createCategoryIcon(catId?: number, index?: number): L.DivIcon {
  const color = getCategoryColor(catId);
  const num   = index !== undefined ? index + 1 : '';
  return new L.DivIcon({
    html: `
      <div style="
        width: 32px; height: 32px;
        background: ${color};
        border: 2.5px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        display: flex; align-items: center; justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-size: 11px;
          font-weight: 800;
          line-height: 1;
        ">${num}</span>
      </div>
    `,
    className:  'bg-transparent border-none',
    iconSize:   [32, 32],
    iconAnchor: [16, 32],
    popupAnchor:[0, -34],
  });
}

// ── Auto-fit bounds ───────────────────────────────────────────────────────────
const FitBounds: React.FC<{ positions: [number, number][] }> = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 13);
      return;
    }
    const bounds = L.latLngBounds(positions.map(p => L.latLng(p[0], p[1])));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [positions.length]);
  return null;
};

// ── Main Component ────────────────────────────────────────────────────────────
const ItineraryMap: React.FC<ItineraryMapProps> = ({ products }) => {
  // Filter produk yang punya koordinat valid
  const withCoords = products.filter(p => {
    const lat = parseFloat(String(p.lat ?? ''));
    const lng = parseFloat(String(p.lng ?? ''));
    return !isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0);
  });

  if (!withCoords.length) return null;

  const positions: [number, number][] = withCoords.map(p => [
    parseFloat(String(p.lat)),
    parseFloat(String(p.lng)),
  ]);

  // Center awal = rata-rata koordinat
  const centerLat = positions.reduce((s, p) => s + p[0], 0) / positions.length;
  const centerLng = positions.reduce((s, p) => s + p[1], 0) / positions.length;

  const formatPrice = (price?: number | string, currency?: string) => {
    if (!price) return null;
    const num = parseFloat(String(price));
    return `${currency ?? 'IDR'} ${num.toLocaleString('id-ID')}`;
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      {/* ── Map ── */}
      <div style={{ height: 320 }}>
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={10}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={false}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com">CartoDB</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <FitBounds positions={positions} />

          {/* Route line */}
          {positions.length > 1 && (
            <Polyline
              positions={positions}
              pathOptions={{
                color:     '#6366f1',
                weight:    2.5,
                opacity:   0.5,
                dashArray: '6 6',
              }}
            />
          )}

          {/* Markers */}
          {withCoords.map((product, i) => (
            <Marker
              key={product.id}
              position={positions[i]}
              icon={createCategoryIcon(product.category_id, i)}
            >
              <Popup
                minWidth={180}
                maxWidth={220}
                className="leaflet-popup-trivgoo"
              >
                <div style={{ padding: '4px 0' }}>
                  <div style={{
                    display: 'inline-block',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: getCategoryColor(product.category_id) + '20',
                    color: getCategoryColor(product.category_id),
                    marginBottom: 6,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {getCategoryLabel(product.category_id)}
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 13, margin: '0 0 4px', lineHeight: 1.3, color: '#111' }}>
                    {product.name}
                  </p>
                  {product.location && (
                    <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px' }}>
                      📍 {product.location.split(',').slice(0, 2).join(',')}
                    </p>
                  )}
                  {formatPrice(product.price, product.currency) && (
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#e5552f', margin: 0 }}>
                      {formatPrice(product.price, product.currency)}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-4 px-4 py-2.5 bg-white border-t border-gray-100">
        {[
          { catId: 1, label: 'Tour' },
          { catId: 2, label: 'Stay' },
          { catId: 3, label: 'Transport' },
        ]
          .filter(cat => withCoords.some(p => {
            if (cat.catId === 1) return !p.category_id || p.category_id === 1;
            return p.category_id === cat.catId;
          }))
          .map(cat => (
            <div key={cat.catId} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: getCategoryColor(cat.catId) }} />
              <span className="text-[10px] font-bold text-gray-500">{cat.label}</span>
            </div>
          ))
        }
        <span className="ml-auto text-[10px] text-gray-400">{withCoords.length} lokasi</span>
      </div>
    </div>
  );
};

export default ItineraryMap;
