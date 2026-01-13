
import React, { useEffect, useRef } from 'react';
import { X, MapPin, History, Globe, Users, CloudSun } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n';

declare const L: any;

interface Props {
  lang: Language;
  onClose: () => void;
}

// USER: Replace this URL with your provided picture URL once ready
const CITY_COVER_IMAGE = "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=1200&auto=format&fit=crop";

const CityBio: React.FC<Props> = ({ lang, onClose }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const t = translations;

  useEffect(() => {
    if (!mapContainerRef.current || typeof L === 'undefined') return;

    if (!mapRef.current) {
      // Map focused on Algeria to show relative location
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
      }).setView([28.0339, 1.6596], 4.5); // Center of Algeria

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(mapRef.current);

      // Add a distinct marker for Touggourt
      const touggourtIcon = L.divIcon({
        className: 'touggourt-pulse',
        html: `<div class="relative flex items-center justify-center">
                <div class="absolute w-8 h-8 bg-orange-500 rounded-full animate-ping opacity-25"></div>
                <div class="w-4 h-4 bg-orange-600 rounded-full border-2 border-white shadow-lg"></div>
              </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      L.marker([33.1064, 6.0628], { icon: touggourtIcon }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden flex flex-col max-h-[92vh] shadow-2xl animate-in slide-in-from-bottom-12 duration-500 ring-1 ring-black/5">
        
        {/* Header Image Section */}
        <div className="relative h-64 flex-shrink-0 group">
          <img 
            src={CITY_COVER_IMAGE} 
            alt="Touggourt City View"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/40"></div>
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 bg-black/20 backdrop-blur-xl text-white rounded-full hover:bg-black/40 transition-all border border-white/20 active:scale-90"
          >
            <X size={20} />
          </button>

          <div className={`absolute bottom-8 ${lang === 'ar' ? 'right-8' : 'left-8'} right-8`}>
            <span className="inline-block px-3 py-1 bg-orange-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-3 shadow-lg shadow-orange-500/30">
              {lang === 'en' ? 'Oasis City' : 'مدينة الواحات'}
            </span>
            <h2 className="text-4xl font-black text-slate-900 drop-shadow-sm leading-tight">
              {t.cityBioTitle[lang]}
            </h2>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 pt-2 scrollbar-hide space-y-8">
          
          <div className="relative">
             <div className="absolute -left-2 top-0 bottom-0 w-1 bg-orange-500 rounded-full opacity-20"></div>
             <p className="text-slate-600 font-medium leading-relaxed italic text-lg pl-4">
                "{t.cityBioDescription[lang]}"
             </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <Users size={18} className="text-orange-500 mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'السكان' : 'Population'}</p>
                <p className="text-sm font-black text-slate-800">~150,000+</p>
             </div>
             <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <CloudSun size={18} className="text-amber-500 mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'المناخ' : 'Climate'}</p>
                <p className="text-sm font-black text-slate-800">{lang === 'ar' ? 'صحراوي مشمس' : 'Desert Sunny'}</p>
             </div>
          </div>

          <div className="space-y-8">
            <section className="flex gap-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0 shadow-inner">
                <MapPin size={24} className="text-blue-500" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 mb-1.5 text-lg">{lang === 'ar' ? 'الموقع والجغرافيا' : 'Location & Geography'}</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {t.locationDetails[lang]}
                </p>
              </div>
            </section>

            <section className="flex gap-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0 shadow-inner">
                <History size={24} className="text-amber-500" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 mb-1.5 text-lg">{lang === 'ar' ? 'لمحة تاريخية' : 'Historical Glimpse'}</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {t.historyDetails[lang]}
                </p>
              </div>
            </section>

            {/* Context Map Visualization */}
            <section className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Globe size={20} className="text-slate-400" />
                  <h4 className="font-black text-slate-900">{t.algeriaLocation[lang]}</h4>
                </div>
                <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 tracking-tighter">
                  {lang === 'ar' ? 'شمال أفريقيا' : 'NORTH AFRICA'}
                </div>
              </div>
              <div className="h-56 rounded-[32px] overflow-hidden border border-slate-200 shadow-inner relative group/map">
                <div ref={mapContainerRef} className="w-full h-full grayscale-[0.3] group-hover/map:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5 rounded-[32px]"></div>
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[12px] font-black text-slate-800 border border-white shadow-xl flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  {lang === 'ar' ? 'تقرت، الجزائر' : 'Touggourt, Algeria'}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="px-8 pb-8 pt-4 bg-white/80 backdrop-blur-md border-t border-slate-50 flex-shrink-0">
          <button 
            onClick={onClose}
            className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-lg shadow-2xl shadow-slate-900/20 active:scale-[0.97] transition-all hover:bg-orange-600 hover:shadow-orange-500/20"
          >
            {t.startExploring[lang]}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CityBio;
