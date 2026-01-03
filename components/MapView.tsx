
import React, { useEffect, useRef } from 'react';
import { Place, Language } from '../types';

// Add global declaration for Leaflet (L) loaded via external script
declare const L: any;

interface Props {
  places: Place[];
  lang: Language;
  onSelectPlace: (place: Place) => void;
}

const MapView: React.FC<Props> = ({ places, lang, onSelectPlace }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map centered on Touggourt
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([33.1064, 6.0628], 13);

      // Add tiles (using a clean Voyager style)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(mapRef.current);
      
      // Add zoom control to bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
    }

    // Clear existing markers if any
    mapRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        mapRef.current.removeLayer(layer);
      }
    });

    // Add markers for each place
    places.forEach(place => {
      const { lat, lng } = place.location;
      
      // Custom icon
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
      
      // Popup content
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
          popup.addEventListener('click', () => {
            onSelectPlace(place);
          });
        }
      });
    });

    // Fit bounds if there are multiple places
    if (places.length > 0) {
      const group = L.featureGroup(places.map(p => L.marker([p.location.lat, p.location.lng])));
      mapRef.current.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      // Cleanup logic if needed
    };
  }, [places, lang, onSelectPlace]);

  return (
    <div className="w-full h-[calc(100vh-280px)] rounded-3xl overflow-hidden shadow-inner border border-slate-200 relative">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      {/* Map Overlay Indicator */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-100">
        {lang === 'en' ? 'Interactive Map' : 'خريطة تفاعلية'}
      </div>
    </div>
  );
};

export default MapView;
