
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
  showPreviews?: boolean;
  activeCategory?: string;
}

const HQ_COORD = [6.057474151150524, 33.100272790822586]; // [lng, lat]
const HQ_NAME = {
  en: 'State headquarters',
  ar: 'مقر الولاية',
  fr: "Siège de l'État"
};

const getRouteColor = (category: string = 'all') => {
  const cat = category.toLowerCase();
  if (cat === 'religion' || cat === 'religious') return '#eab308'; // Yellow
  if (cat === 'culture' || cat === 'cultural') return '#ef4444'; // Red
  if (cat === 'nature' || cat === 'natural') return '#22c55e'; // Green
  if (cat === 'services' || cat === 'hotels' || cat === 'restaurants') return '#3b82f6'; // Blue
  return '#ea580c'; // Orange (Default / All)
};

const getServiceMapVisuals = (sub: string, description?: string) => {
  const iconSize = 20;
  let svg = '';
  let bg = 'bg-slate-500';
  const desc = (description || '').toLowerCase();

  switch (sub) {
    case 'mosques':
      bg = 'bg-emerald-500';
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="21" x2="21" y2="21"/><path d="M4 21V10l8-7 8 7v11"/><path d="M9 21v-8a3 3 0 0 1 6 0v8"/></svg>`;
      break;
    case 'coffee':
      bg = 'bg-orange-500';
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>`;
      break;
    case 'hotels':
      bg = 'bg-indigo-500';
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12"/><path d="M2 10h20"/><path d="M2 14h20"/><path d="M5 20v-4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v4"/><path d="M11 20v-4a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v4"/></svg>`;
      break;
    case 'restaurants':
      bg = 'bg-rose-500';
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`;
      break;
    case 'banks':
      bg = 'bg-blue-600';
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6l7-4 7 4"/><path d="M4 10v11"/><path d="M20 10v11"/><path d="M8 14v3"/><path d="M12 14v3"/><path d="M16 14v3"/></svg>`;
      break;
    case 'pharmacies':
    case 'hospitals':
      bg = 'bg-red-500';
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>`;
      break;
    case 'schools':
      bg = 'bg-violet-600';
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;
      break;
    case 'stores':
      bg = 'bg-amber-500';
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
      break;
    case 'parking':
      bg = 'bg-slate-600';
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`;
      break;
    case 'fuel':
      bg = 'bg-yellow-600';
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="15" y2="22"/><path d="M4 9h11"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L20 7"/></svg>`;
      break;
    case 'transportation':
      if (desc.includes('train')) {
        bg = 'bg-cyan-600';
        svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20"/><path d="M15 18H9"/><path d="M12 18V4"/><path d="M7 10V4h10v6"/><path d="M3 10h18"/><path d="M3 14h18"/><path d="M3 18h18"/></svg>`;
      } else if (desc.includes('airport') || desc.includes('aerodrome')) {
        bg = 'bg-sky-600';
        svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.7 5.2c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/></svg>`;
      } else {
        bg = 'bg-blue-500';
        svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="12" x="4" y="3" rx="2"/><path d="M4 11h16"/><line x1="8" y1="15" x2="8" y2="15.01"/><line x1="16" y1="15" x2="16" y2="15.01"/><path d="M6 19v2"/><path d="M18 19v2"/></svg>`;
      }
      break;
    case 'parks':
      bg = 'bg-emerald-600';
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 10v.01"/><path d="M16 10v.01"/><path d="M12 2L8 6h8l-4-4z"/><path d="M12 22v-9"/><path d="M9 18l3-3 3 3"/><path d="M20 13c.5 0 1-.5 1-1s-1-4-3-4-3 1-3 1-1-1-3-1-3 3-3 4 .5 1 1 1h7z"/></svg>`;
      break;
    default:
      bg = 'bg-slate-400';
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  }

  return { svg, bg };
};

const MapView: React.FC<Props> = ({ 
  places, 
  lang, 
  onSelectPlace, 
  height = "h-[calc(100dvh-320px)]",
  initialZoom = 13,
  interactive = true,
  showPreviews = false,
  activeCategory = 'all'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const popupOverlayRef = useRef<any>(null);
  const markerOverlaysRef = useRef<any[]>([]);
  const routeLayerRef = useRef<any>(null);
  const t = translations;

  const cityCenter = [6.0628, 33.1064]; // [lng, lat] for OpenLayers

  // Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || typeof ol === 'undefined' || mapRef.current) return;

    // Create a container for the popup
    const popupElement = document.createElement('div');
    popupElement.className = 'ol-popup';
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

    // Initialize Route Layer
    const routeSource = new ol.source.Vector();
    const routeLayer = new ol.layer.Vector({
      source: routeSource,
      style: new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: getRouteColor(activeCategory),
          width: 6,
          lineCap: 'round',
          lineJoin: 'round',
        }),
      }),
    });
    routeLayerRef.current = routeLayer;

    // Create the map
    mapRef.current = new ol.Map({
      target: mapContainerRef.current,
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM(),
        }),
        routeLayer,
      ],
      overlays: [popupOverlay],
      view: new ol.View({
        center: ol.proj.fromLonLat(cityCenter),
        zoom: initialZoom,
        multiWorld: false,
      }),
      controls: [],
      interactions: interactive ? ol.interaction.defaults.defaults() : [],
    });

    mapRef.current.on('click', () => {
      popupOverlay.setPosition(undefined);
    });

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

  // Update Markers and Route
  useEffect(() => {
    if (!mapRef.current || !popupOverlayRef.current || !routeLayerRef.current || typeof ol === 'undefined') return;

    const map = mapRef.current;
    const routeLayer = routeLayerRef.current;
    const routeSource = routeLayer.getSource();
    const color = getRouteColor(activeCategory);

    // Update Layer Style Color
    routeLayer.setStyle(new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: color,
        width: 6,
        lineCap: 'round',
        lineJoin: 'round',
      }),
    }));
    
    // Clear previous state
    routeSource.clear();
    markerOverlaysRef.current.forEach(overlay => map.removeOverlay(overlay));
    markerOverlaysRef.current = [];

    // --- ADD STATE HEADQUARTERS REFERENCE POINT ---
    const hqCoord = ol.proj.fromLonLat(HQ_COORD);
    const hqMarkerEl = document.createElement('div');
    hqMarkerEl.className = 'marker-container group cursor-pointer';
    hqMarkerEl.dir = 'ltr';
    hqMarkerEl.innerHTML = `
      <div class="relative flex flex-col items-center gap-1 group active:scale-95 transition-transform animate-in zoom-in duration-300">
        <div class="w-10 h-10 bg-slate-900 rounded-xl border-2 border-white shadow-2xl flex items-center justify-center text-white ring-4 ring-slate-900/10 transform transition-all group-hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7M4 21V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v17"/>
          </svg>
        </div>
        <div class="bg-slate-900/95 backdrop-blur-md px-2 py-1 rounded-lg shadow-xl border border-white/20 -mt-1 relative z-10">
          <p class="text-[7px] font-black text-white truncate text-center uppercase tracking-tighter">${HQ_NAME[lang]}</p>
        </div>
      </div>
    `;

    hqMarkerEl.onclick = (e) => {
      e.stopPropagation();
      const contentDir = lang === 'ar' ? 'rtl' : 'ltr';
      const popupContent = `
        <div class="p-3 bg-white" dir="${contentDir}">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7M4 21V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v17"/></svg>
            </div>
            <h4 class="font-black text-xs text-slate-900 leading-tight">${HQ_NAME[lang]}</h4>
          </div>
          <p class="text-[9px] text-slate-500 font-bold">${lang === 'ar' ? 'نقطة مرجعية رسمية' : (lang === 'fr' ? 'Point de référence officiel' : 'Official reference point')}</p>
        </div>
      `;
      const popupOverlay = popupOverlayRef.current;
      popupOverlay.getElement().innerHTML = popupContent;
      popupOverlay.setPosition(hqCoord);
    };

    const hqOverlay = new ol.Overlay({
      position: hqCoord,
      positioning: 'center-center',
      element: hqMarkerEl,
      stopEvent: true,
    });
    map.addOverlay(hqOverlay);
    markerOverlaysRef.current.push(hqOverlay);
    // ----------------------------------------------

    if (places.length === 0) return;

    // Identify start (most southern) and end (most northern) points
    const validPlaces = places.filter(p => !isNaN(parseFloat(p.location?.lat as any)) && !isNaN(parseFloat(p.location?.lng as any)));
    if (validPlaces.length === 0) return;

    const sortedByLat = [...validPlaces].sort((a, b) => parseFloat(a.location.lat as any) - parseFloat(b.location.lat as any));
    const southernmostPlaceId = sortedByLat[0].id;
    const northernmostPlaceId = sortedByLat[sortedByLat.length - 1].id;
    const isSinglePlace = southernmostPlaceId === northernmostPlaceId;

    const coordCounts: Record<string, number> = {};
    const points: any[] = [];
    const routingCoords: string[] = [];

    places.forEach((place) => {
      const lat = parseFloat(place.location?.lat as any);
      const lng = parseFloat(place.location?.lng as any);

      if (isNaN(lat) || isNaN(lng)) return;

      routingCoords.push(`${lng},${lat}`);

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

      const markerEl = document.createElement('div');
      markerEl.className = 'marker-container group cursor-pointer';
      markerEl.dir = 'ltr'; 

      const isStart = place.id === southernmostPlaceId && !isSinglePlace;
      const isEnd = place.id === northernmostPlaceId && !isSinglePlace;
      
      const badgeHtml = isStart 
        ? `<div class="absolute top-full mt-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap z-50 animate-bounce">${t.startPoint[lang]}</div>`
        : isEnd 
          ? `<div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-600 text-white px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap z-50 animate-bounce">${t.endPoint[lang]}</div>`
          : '';

      if (showPreviews) {
        if (place.category === 'services' || place.id.startsWith('osm-')) {
          const visuals = getServiceMapVisuals(place.subCategory || 'all', place.description?.[lang]);
          markerEl.innerHTML = `
            <div class="relative flex flex-col items-center gap-1 group active:scale-95 transition-transform animate-in zoom-in duration-300">
              ${badgeHtml}
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-white shadow-2xl relative ${visuals.bg}">
                <div class="text-white">${visuals.svg}</div>
              </div>
              <div class="bg-white/95 backdrop-blur-md px-2 py-1 rounded-xl shadow-xl border border-white/50 -mt-2 relative z-10 max-w-[90px]">
                <p class="text-[7px] font-black text-slate-900 truncate text-center">${place.name[lang]}</p>
              </div>
            </div>
          `;
        } else {
          const coverImg = place.imageUrl?.cover || 'https://images.unsplash.com/photo-1544411047-c4915842273b?q=80&w=800&auto=format&fit=crop';
          markerEl.innerHTML = `
            <div class="relative flex flex-col items-center gap-1 group active:scale-95 transition-transform animate-in zoom-in duration-300">
              ${badgeHtml}
              <div class="w-14 h-14 rounded-2xl overflow-hidden border-4 border-white shadow-2xl relative">
                <img src="${coverImg}" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
              <div class="bg-white/95 backdrop-blur-md px-2 py-1 rounded-xl shadow-xl border border-white/50 -mt-2 relative z-10 max-w-[90px]">
                <p class="text-[7px] font-black text-slate-900 truncate text-center">${place.name[lang]}</p>
              </div>
            </div>
          `;
        }
      } else {
        markerEl.innerHTML = `
          <div class="relative">
            ${badgeHtml}
            <div class="w-10 h-10 bg-orange-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white ring-4 ring-orange-500/10 transform transition-all group-hover:scale-110 active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          </div>
        `;
      }

      markerEl.onclick = (e) => {
        e.stopPropagation();
        if (showPreviews && onSelectPlace) {
           onSelectPlace(place);
           return;
        }

        const coverImg = place.imageUrl?.cover || 'https://images.unsplash.com/photo-1544411047-c4915842273b?q=80&w=800&auto=format&fit=crop';
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

    // Draw Road-Following Path
    const drawRoute = async () => {
      if (routingCoords.length < 2) return;

      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${routingCoords.join(';')}?overview=full&geometries=polyline`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.code === 'Ok' && data.routes?.[0]?.geometry) {
          const polyline = data.routes[0].geometry;
          const routeFeature = new ol.Feature({
            geometry: new ol.format.Polyline().readGeometry(polyline, {
              dataProjection: 'EPSG:4326',
              featureProjection: 'EPSG:3857',
            }),
          });
          routeSource.addFeature(routeFeature);
        } else {
          throw new Error('OSRM routing failed');
        }
      } catch (error) {
        console.warn('Road-following routing failed, falling back to straight lines:', error);
        // Fallback: Dashed straight line
        const lineGeom = new ol.geom.LineString(points);
        const fallbackFeature = new ol.Feature({ geometry: lineGeom });
        fallbackFeature.setStyle(new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: color,
            width: 4,
            lineDash: [10, 10],
          }),
        }));
        routeSource.addFeature(fallbackFeature);
      }
    };

    drawRoute();

    if (points.length > 0) {
      // Include the HQ point in the extent fit if necessary
      const fitPoints = [...points, hqCoord];
      const extent = ol.extent.boundingExtent(fitPoints);
      map.getView().fit(extent, {
        padding: [80, 80, 80, 80],
        maxZoom: 16,
        duration: 500
      });
    }
  }, [places, lang, onSelectPlace, showPreviews, activeCategory]);

  return (
    <div className={`w-full ${height} rounded-[40px] overflow-hidden shadow-2xl border border-white relative bg-slate-100 group animate-in zoom-in-95 duration-700`}>
      <div ref={mapContainerRef} className="w-full h-full z-0" dir="ltr" />
      
      <div className={`absolute top-4 ${lang === 'ar' ? 'right-4' : 'left-4'} z-10 flex flex-col gap-2`}>
        <div className="bg-white/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-xl border border-white/50 flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-orange-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(234,88,12,0.5)]"></div>
          <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
            {t.interactiveMap[lang]}
          </span>
        </div>
      </div>

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
