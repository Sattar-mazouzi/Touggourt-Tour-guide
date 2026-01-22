
import React, { useEffect, useRef } from 'react';
import { Place, Language } from '../types';
import { translations } from '../i18n';

declare const L: any;

interface Props {
  places: Place[];
  lang: Language;
  onSelectPlace?: (place: Place) => void;
  height?: string;
  initialZoom?: number;
  interactive?: boolean;
}

const MapView: React.FC<Props> = ({ 
  places, 
  lang, 
  onSelectPlace, 
  height = "h-[calc(100dvh-320px)]",
  initialZoom = 13,
  interactive = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const t = translations;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || typeof L === 'undefined' || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: interactive,
      touchZoom: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
    }).setView([33.1064, 6.0628], initialZoom);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(mapRef.current);
    
    if (interactive) {
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
    }

    // Force an initial invalidation to ensure the map fills the container correctly
    setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    }, 100);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Sync Markers and Viewport
  useEffect(() => {
    if (!mapRef.current || typeof L === 'undefined') return;

    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    if (places.length === 0) return;

    const bounds = L.latLngBounds([]);
    const markers: any[] = [];

    places.forEach(place => {
      const { lat, lng } = place.location;
      if (!lat || !lng) return;
      
      const pos = L.latLng(lat, lng);
      bounds.extend(pos);

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="w-10 h-10 bg-orange-600 rounded-full border-2 border-white shadow-2xl flex items-center justify-center text-white transform transition-transform active:scale-90">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });

      const marker = L.marker(pos, { icon: customIcon }).addTo(map);
      
      if (onSelectPlace) {
        const coverImg = place.imageUrl?.cover || 'https://images.unsplash.com/photo-1544411047-c4915842273b?q=80&w=800&auto=format&fit=crop';
        
        const popupContent = `
          <div class="cursor-pointer overflow-hidden rounded-[24px] bg-white shadow-2xl border border-slate-50">
            <img src="${coverImg}" class="w-full h-28 object-cover" />
            <div class="p-4">
              <h4 class="font-black text-sm text-slate-900 leading-tight">${place.name[lang]}</h4>
              <div class="flex items-center gap-1 mt-2 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span class="text-[9px] font-black uppercase tracking-tighter truncate">${place.address?.[lang] || ''}</span>
              </div>
            </div>
          </div>
        `;
        
        marker.bindPopup(popupContent, {
          closeButton: false,
          offset: L.point(0, -5),
          className: 'map-popup-custom'
        });
        
        marker.on('popupopen', (e: any) => {
          const popup = e.popup.getElement();
          if (popup) {
            popup.addEventListener('click', () => onSelectPlace(place));
          }
        });
      }
      
      markers.push(marker);
    });

    markersRef.current = markers;

    // Apply viewport bounds logic with a small delay to ensure rendering is complete
    const updateViewport = () => {
      if (markers.length === 1) {
        map.setView(markers[0].getLatLng(), initialZoom, { animate: true });
      } else if (markers.length > 1) {
        map.fitBounds(bounds.pad(0.2), { 
          animate: true,
          duration: 0.8,
          padding: [20, 20]
        });
      }
      map.invalidateSize();
    };

    // Multiple triggers for reliability
    updateViewport();
    const timer1 = setTimeout(updateViewport, 100);
    const timer2 = setTimeout(updateViewport, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };

  }, [places, lang, onSelectPlace, initialZoom]);

  return (
    <div className={`w-full ${height} rounded-[40px] overflow-hidden shadow-2xl border border-white relative bg-slate-100 group`}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      <div className={`absolute top-4 ${lang === 'ar' ? 'right-4' : 'left-4'} z-10`}>
        <div className="bg-white/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-xl border border-white/50 flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-orange-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(234,88,12,0.5)]"></div>
          <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
            {t.interactiveMap[lang]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapView;
