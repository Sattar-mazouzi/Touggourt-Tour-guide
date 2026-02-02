
import React, { useEffect, useRef } from 'react';
import { Place, Language } from '../types';
import { translations } from '../i18n';

// Use 'ol' global provided by the script tag in index.html
declare const ol: any;

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
  const popupOverlayRef = useRef<any>(null);
  const markerOverlaysRef = useRef<any[]>([]);
  const t = translations;

  const cityCenter = [6.0628, 33.1064]; // [lng, lat] for OpenLayers

  // Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || typeof ol === 'undefined' || mapRef.current) return;

    // Create a container for the popup
    const popupElement = document.createElement('div');
    popupElement.className = 'ol-popup';
    // Force LTR on the positioning container to prevent RTL coordinate flipping
    popupElement.dir = 'ltr'; 
    document.body.appendChild(popupElement);

    const popupOverlay = new ol.Overlay({
      element: popupElement,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    });
    popupOverlayRef.current = popupOverlay;

    // Create the map
    mapRef.current = new ol.Map({
      target: mapContainerRef.current,
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM(), // Standard OpenStreetMap source
        }),
      ],
      overlays: [popupOverlay],
      view: new ol.View({
        center: ol.proj.fromLonLat(cityCenter),
        zoom: initialZoom,
        multiWorld: false,
      }),
      controls: [], // We manage our own UI
      interactions: interactive ? ol.interaction.defaults.defaults() : [],
    });

    // Close popup on map click
    mapRef.current.on('click', () => {
      popupOverlay.setPosition(undefined);
    });

    // Handle container resizing
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.updateSize();
      }
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (popupElement.parentNode) {
        popupElement.parentNode.removeChild(popupElement);
      }
      if (mapRef.current) {
        mapRef.current.setTarget(null);
        mapRef.current = null;
      }
    };
  }, []);

  // Update Markers and Viewport
  useEffect(() => {
    if (!mapRef.current || !popupOverlayRef.current || typeof ol === 'undefined') return;

    const map = mapRef.current;
    
    // Clear previous marker overlays
    markerOverlaysRef.current.forEach(overlay => map.removeOverlay(overlay));
    markerOverlaysRef.current = [];

    if (places.length === 0) return;

    const coordCounts: Record<string, number> = {};
    const points: any[] = [];

    places.forEach((place) => {
      const lat = parseFloat(place.location?.lat as any);
      const lng = parseFloat(place.location?.lng as any);

      if (isNaN(lat) || isNaN(lng)) return;

      const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
      const count = coordCounts[key] || 0;
      coordCounts[key] = count + 1;

      let markerLat = lat;
      let markerLng = lng;

      if (count > 0) {
        const spiralFactor = 0.00015;
        const angle = count * (2 * Math.PI / 8);
        markerLat += (spiralFactor * count) * Math.cos(angle);
        markerLng += (spiralFactor * count) * Math.sin(angle);
      }

      const coordinate = ol.proj.fromLonLat([markerLng, markerLat]);
      points.push(coordinate);

      // Create Marker DOM element
      const markerEl = document.createElement('div');
      markerEl.className = 'marker-container group cursor-pointer';
      // Force LTR on marker container to ensure 'center-center' positioning is accurate
      markerEl.dir = 'ltr'; 
      
      markerEl.innerHTML = `
        <div class="w-10 h-10 bg-orange-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white ring-4 ring-orange-500/10 transform transition-all group-hover:scale-110 active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `;

      markerEl.onclick = (e) => {
        e.stopPropagation();
        
        const coverImg = place.imageUrl?.cover || 'https://images.unsplash.com/photo-1544411047-c4915842273b?q=80&w=800&auto=format&fit=crop';
        
        // Use current language direction for text content INSIDE the LTR-positioned popup
        const contentDir = lang === 'ar' ? 'rtl' : 'ltr';
        const popupContent = `
          <div class="p-0 overflow-hidden cursor-pointer" id="popup-inner-${place.id}" dir="${contentDir}">
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
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="${lang === 'ar' ? 'rotate-180' : ''}"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          </div>
        `;

        const popupOverlay = popupOverlayRef.current;
        popupOverlay.getElement().innerHTML = popupContent;
        popupOverlay.setPosition(coordinate);

        const inner = document.getElementById(`popup-inner-${place.id}`);
        if (inner && onSelectPlace) {
          inner.onclick = () => onSelectPlace(place);
        }
      };

      const overlay = new ol.Overlay({
        position: coordinate,
        positioning: 'center-center',
        element: markerEl,
        stopEvent: true,
      });

      map.addOverlay(overlay);
      markerOverlaysRef.current.push(overlay);
    });

    if (points.length > 0) {
      const extent = ol.extent.boundingExtent(points);
      map.getView().fit(extent, {
        padding: [80, 80, 80, 80],
        maxZoom: 16,
        duration: 500
      });
    }
  }, [places, lang, onSelectPlace]);

  return (
    <div className={`w-full ${height} rounded-[40px] overflow-hidden shadow-2xl border border-white relative bg-slate-100 group animate-in zoom-in-95 duration-700`}>
      {/* 
          CRITICAL: dir="ltr" on map container prevents RTL logic from breaking 
          coordinate-to-pixel mapping in OpenLayers. 
      */}
      <div ref={mapContainerRef} className="w-full h-full z-0" dir="ltr" />
      
      {/* Interactive Controls Overlay */}
      <div className={`absolute top-4 ${lang === 'ar' ? 'right-4' : 'left-4'} z-10 flex flex-col gap-2`}>
        <div className="bg-white/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-xl border border-white/50 flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-orange-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(234,88,12,0.5)]"></div>
          <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
            {t.interactiveMap[lang]}
          </span>
        </div>
      </div>

      {/* Places Count Label & Reset View */}
      {places.length > 0 && (
         <div className={`absolute bottom-4 ${lang === 'ar' ? 'left-4' : 'right-4'} z-10`}>
            <button 
              onClick={() => {
                const map = mapRef.current;
                if (!map) return;
                const markerCoords = markerOverlaysRef.current.map(o => o.getPosition()).filter(p => !!p);
                if (markerCoords.length > 0) {
                  const extent = ol.extent.boundingExtent(markerCoords);
                  map.getView().fit(extent, { padding: [80, 80, 80, 80], duration: 500 });
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
