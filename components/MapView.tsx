
import React, { useEffect, useRef } from 'react';
import { Place, Language } from '../types';

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
  height = "h-[calc(100vh-280px)]",
  initialZoom = 13,
  interactive = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || typeof L === 'undefined') return;

    // Initialize map if not already done
    if (!mapRef.current) {
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
    }

    // Clear old markers
    markersRef.current.forEach(m => mapRef.current.removeLayer(m));
    markersRef.current = [];

    // Add markers
    places.forEach(place => {
      const { lat, lng } = place.location;
      
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="w-8 h-8 bg-orange-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(mapRef.current);
      
      if (onSelectPlace) {
        const popupContent = `
          <div class="cursor-pointer overflow-hidden rounded-xl">
            <img src="${place.imageUrl}" class="w-full h-24 object-cover" />
            <div class="p-2">
              <h4 class="font-bold text-sm text-slate-900">${place.name[lang]}</h4>
              <p class="text-[10px] text-slate-500">${place.location.address[lang]}</p>
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);
        marker.on('popupopen', () => {
          const popup = document.querySelector('.leaflet-popup-content');
          if (popup) {
            popup.addEventListener('click', () => onSelectPlace(place));
          }
        });
      }
      
      markersRef.current.push(marker);
    });

    // Adjust view
    if (places.length === 1) {
      mapRef.current.setView([places[0].location.lat, places[0].location.lng], initialZoom);
    } else if (places.length > 1) {
      const group = L.featureGroup(markersRef.current);
      mapRef.current.fitBounds(group.getBounds().pad(0.1));
    }

    // Force redraw for hidden containers
    setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    }, 200);

  }, [places, lang, onSelectPlace, initialZoom, interactive]);

  return (
    <div className={`w-full ${height} rounded-3xl overflow-hidden shadow-inner border border-slate-200 relative`}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-100 pointer-events-none">
        {lang === 'en' ? 'Interactive Map' : 'خريطة تفاعلية'}
      </div>
    </div>
  );
};

export default MapView;
