
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
  const featureGroupRef = useRef<any>(null);
  const t = translations;

  const cityCenter = [33.1064, 6.0628];

  // Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || typeof L === 'undefined' || mapRef.current) return;

    // Create the map
    mapRef.current = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: interactive,
      touchZoom: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      // Use Canvas renderer for better performance with many markers
      renderer: L.canvas()
    }).setView(cityCenter, initialZoom);

    // Add high-quality tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(mapRef.current);
    
    // FeatureGroup is superior for bounds management
    featureGroupRef.current = L.featureGroup().addTo(mapRef.current);

    if (interactive) {
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
    }

    // Handle container resizing
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Markers and Viewport
  useEffect(() => {
    if (!mapRef.current || !featureGroupRef.current || typeof L === 'undefined') return;

    const map = mapRef.current;
    const featureGroup = featureGroupRef.current;

    // 1. Clear previous layers
    featureGroup.clearLayers();

    if (places.length === 0) {
      map.setView(cityCenter, 12, { animate: true });
      return;
    }

    // 2. Track coordinate counts to detect overlaps
    const coordCounts: Record<string, number> = {};

    // 3. Populate markers
    places.forEach((place) => {
      const lat = parseFloat(place.location?.lat as any);
      const lng = parseFloat(place.location?.lng as any);

      if (isNaN(lat) || isNaN(lng)) return;

      // Handle identical coordinates with tiny jitter to prevent perfect stacking
      const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
      const count = coordCounts[key] || 0;
      coordCounts[key] = count + 1;

      let markerLat = lat;
      let markerLng = lng;

      if (count > 0) {
        // Apply very tiny spiral offset
        const angle = 0.1 * count;
        markerLat += (0.00008 * count) * Math.cos(angle);
        markerLng += (0.00008 * count) * Math.sin(angle);
      }

      const pos = L.latLng(markerLat, markerLng);

      // Create Custom Icon
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="marker-container group">
            <div class="w-10 h-10 bg-orange-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white ring-4 ring-orange-500/10 transform transition-all group-hover:scale-110 group-active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });

      const marker = L.marker(pos, { 
        icon: customIcon,
        riseOnHover: true,
        alt: place.name[lang]
      });

      // Simple Popup
      if (onSelectPlace) {
        const coverImg = place.imageUrl?.cover || 'https://images.unsplash.com/photo-1544411047-c4915842273b?q=80&w=800&auto=format&fit=crop';
        
        const popupContent = L.DomUtil.create('div', 'p-0 overflow-hidden');
        popupContent.innerHTML = `
          <div class="relative h-28 w-full">
            <img src="${coverImg}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div class="absolute bottom-2 left-3 right-3">
               <h4 class="font-black text-xs text-white leading-tight shadow-sm">${place.name[lang] || ''}</h4>
            </div>
          </div>
          <div class="p-3 bg-white flex items-center justify-between gap-2">
            <div class="flex items-center gap-1 text-slate-400 overflow-hidden">
               <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
               <span class="text-[8px] font-bold uppercase tracking-tight truncate">${place.address?.[lang] || ''}</span>
            </div>
            <div class="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </div>
        `;

        L.DomEvent.on(popupContent, 'click', (e: any) => {
          L.DomEvent.stop(e);
          onSelectPlace(place);
        });

        marker.bindPopup(popupContent, {
          closeButton: false,
          offset: L.point(0, -5),
          className: 'custom-map-popup'
        });
      }

      marker.addTo(featureGroup);
    });

    // 4. Update viewport to fit ALL layers
    const fitAll = () => {
      if (!map || !featureGroup) return;
      const layers = featureGroup.getLayers();
      if (layers.length === 0) return;

      if (layers.length === 1) {
        map.setView(layers[0].getLatLng(), 15, { animate: true });
      } else {
        const bounds = featureGroup.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { 
            padding: [50, 50], 
            animate: true,
            maxZoom: 16
          });
        }
      }
      map.invalidateSize();
    };

    fitAll();
    const timers = [
      setTimeout(fitAll, 100),
      setTimeout(fitAll, 500)
    ];

    return () => timers.forEach(clearTimeout);

  }, [places, lang, onSelectPlace, initialZoom]);

  return (
    <div className={`w-full ${height} rounded-[40px] overflow-hidden shadow-2xl border border-white relative bg-slate-100 group animate-in zoom-in-95 duration-700`}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Interactive Controls Overlay - lowered z-index to 10 */}
      <div className={`absolute top-4 ${lang === 'ar' ? 'right-4' : 'left-4'} z-10 flex flex-col gap-2`}>
        <div className="bg-white/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-xl border border-white/50 flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-orange-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(234,88,12,0.5)]"></div>
          <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
            {t.interactiveMap[lang]}
          </span>
        </div>
      </div>

      {/* Places Count Label - lowered z-index to 10 */}
      {places.length > 0 && (
         <div className={`absolute bottom-4 ${lang === 'ar' ? 'left-4' : 'right-4'} z-10`}>
            <button 
              onClick={() => {
                const map = mapRef.current;
                const fg = featureGroupRef.current;
                if (map && fg && fg.getLayers().length > 0) {
                  const bounds = fg.getBounds();
                  if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50], animate: true });
                  }
                }
              }}
              className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-lg flex items-center gap-2 active:scale-[0.98] transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
              {places.length} {t.explore[lang]}
            </button>
         </div>
      )}
    </div>
  );
};

export default MapView;
