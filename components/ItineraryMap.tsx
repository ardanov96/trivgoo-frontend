import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPrice(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return String(price);
  return num.toLocaleString('id-ID');
}

function categoryColor(catId: number): string {
  if (catId === 1 || catId === 3) return '#EF4444'; // Tour → merah
  if (catId === 2)                 return '#8B5CF6'; // Stay → ungu
  return '#F59E0B';                                  // Transport → amber
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface ProductWithCoords extends Product {
  lat?: string | number;
  lng?: string | number;
}

// ── Component ─────────────────────────────────────────────────────────────────
const ItineraryMap: React.FC<{ products: Product[] }> = ({ products }) => {
  const mapRef   = useRef<HTMLDivElement>(null);
  const mapObj   = useRef<any>(null);
  const markers  = useRef<any[]>([]);
  const apiKey   = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

  const withCoords = (products as ProductWithCoords[]).filter(
    p => p.lat && p.lng && !isNaN(parseFloat(String(p.lat)))
  );

  useEffect(() => {
    if (!withCoords.length || !mapRef.current || !apiKey) return;

    const initMap = () => {
      const google = (window as any).google;
      if (!google?.maps || !mapRef.current) return;

      // Hitung center dari rata-rata koordinat
      const avgLat = withCoords.reduce((s, p) => s + parseFloat(String(p.lat)), 0) / withCoords.length;
      const avgLng = withCoords.reduce((s, p) => s + parseFloat(String(p.lng!)), 0) / withCoords.length;

      if (!mapObj.current) {
        mapObj.current = new google.maps.Map(mapRef.current, {
          center:            { lat: avgLat, lng: avgLng },
          zoom:              10,
          disableDefaultUI:  true,
          zoomControl:       true,
          zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
          styles: [
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          ],
        });
      } else {
        mapObj.current.setCenter({ lat: avgLat, lng: avgLng });
      }

      // Hapus markers lama
      markers.current.forEach(m => m.setMap(null));
      markers.current = [];

      const bounds = new google.maps.LatLngBounds();

      withCoords.forEach((p, i) => {
        const pos = {
          lat: parseFloat(String(p.lat)),
          lng: parseFloat(String(p.lng)),
        };
        bounds.extend(pos);

        // Custom marker dengan nomor
        const marker = new google.maps.Marker({
          position: pos,
          map:      mapObj.current,
          title:    p.name,
          label: {
            text:      String(i + 1),
            color:     'white',
            fontSize:  '11px',
            fontWeight: '700',
          },
          icon: {
            path:         google.maps.SymbolPath.CIRCLE,
            scale:        14,
            fillColor:    categoryColor(p.category_id),
            fillOpacity:  1,
            strokeColor:  'white',
            strokeWeight: 2,
          },
        });

        const infoContent = `
          <div style="font-family:sans-serif;max-width:200px;padding:4px 0">
            <p style="font-weight:700;font-size:12px;margin:0 0 4px;color:#111;line-height:1.4">${p.name}</p>
            <p style="font-size:11px;color:#666;margin:0 0 2px">${p.location?.split(',')[0] ?? ''}</p>
            <p style="font-size:12px;font-weight:700;color:#E05845;margin:0">${p.currency ?? 'IDR'} ${formatPrice(p.price)}</p>
          </div>`;

        const infoWindow = new google.maps.InfoWindow({ content: infoContent });
        marker.addListener('click', () => {
          infoWindow.open(mapObj.current, marker);
        });

        markers.current.push(marker);
      });

      // Fit semua marker
      if (withCoords.length > 1) {
        mapObj.current.fitBounds(bounds, { padding: 40 });
      }
    };

    if ((window as any).google?.maps) {
      initMap();
    } else if (apiKey) {
      // Load sekali, cek agar tidak double load
      const existing = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existing) {
        existing.addEventListener('load', initMap);
      } else {
        const script    = document.createElement('script');
        script.src      = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        script.async    = true;
        script.onload   = initMap;
        script.onerror  = () => console.warn('[Map] Gagal load Google Maps API');
        document.head.appendChild(script);
      }
    }
  }, [products]);

  // Jangan render jika tidak ada koordinat atau API key
  if (!withCoords.length || !apiKey) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
        <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <span className="text-sm font-bold text-gray-900">Peta Perjalanan</span>
        <span className="text-[10px] text-gray-400 ml-auto">{withCoords.length} lokasi</span>
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ height: '220px', width: '100%' }} />

      {/* Legend */}
      <div className="px-4 py-2.5 border-t border-gray-50 flex items-center gap-4 flex-wrap">
        {[
          { color: '#EF4444', label: 'Tour' },
          { color: '#8B5CF6', label: 'Stay' },
          { color: '#F59E0B', label: 'Transport' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: l.color }} />
            <span className="text-[10px] text-gray-500 font-bold">{l.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ItineraryMap;
