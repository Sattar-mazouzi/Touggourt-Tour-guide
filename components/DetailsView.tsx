
import React from 'react';
import { Place, Language } from '../types';
import { X, MapPin, Star, Navigation, Share2, Info } from 'lucide-react';
import { translations } from '../i18n';
import MapView from './MapView';

interface Props {
  place: Place;
  lang: Language;
  onClose: () => void;
}

const DetailsView: React.FC<Props> = ({ place, lang, onClose }) => {
  const t = translations;

  const handleOpenMap = () => {
    if (!place.location || typeof place.location.lat !== 'number' || typeof place.location.lng !== 'number') {
      console.error("Invalid location data for directions");
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`;
    window.open(url, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const currentUrl = window.location.href;
        const isValidUrl = currentUrl.startsWith('http');
        
        await navigator.share({
          title: place.name[lang],
          text: place.description[lang],
          ...(isValidUrl ? { url: currentUrl } : {}),
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col h-[100dvh] overflow-hidden animate-in slide-in-from-bottom duration-300">
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-32">
        <div className="relative h-[40vh] flex-shrink-0">
          <img 
            src={place.imageUrl} 
            alt={place.name[lang]} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pt-[calc(1rem+env(safe-area-inset-top))]">
            <button 
              onClick={onClose}
              className="p-2 bg-white/80 backdrop-blur rounded-full shadow-lg active:scale-90 transition-transform"
            >
              <X size={24} className="text-slate-900" />
            </button>
            <div className="flex gap-2">
              <button 
                onClick={handleShare}
                className="p-2 bg-white/80 backdrop-blur rounded-full shadow-lg active:scale-90 transition-transform"
              >
                <Share2 size={24} className="text-slate-900" />
              </button>
            </div>
          </div>
          <div className="absolute bottom-10 left-6 right-6">
            <span className="inline-block bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2">
              {t[place.category]?.[lang] || place.category}
            </span>
            <h2 className="text-3xl font-black text-white drop-shadow-md">{place.name[lang]}</h2>
          </div>
        </div>

        <div className="bg-white -mt-8 rounded-t-[40px] p-8 shadow-2xl relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-slate-500">
              <MapPin size={20} className="text-orange-500" />
              <span className="text-sm font-medium">{place.address?.[lang] || ''}</span>
            </div>
            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-2xl border border-yellow-200">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-bold text-yellow-700">{place.rating}</span>
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Info size={16} className="text-blue-500" /></span>
                {t.overview[lang]}
              </h3>
              <p className="text-slate-600 leading-relaxed text-base">
                {place.description[lang]}
              </p>
            </section>

            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  {t.map[lang]}
                </h3>
                <button 
                  onClick={handleOpenMap}
                  className="text-xs font-bold text-orange-600 flex items-center gap-1 hover:underline"
                >
                  {t.getDirections[lang]} <Navigation size={12} />
                </button>
              </div>
              
              <MapView 
                places={[place]} 
                lang={lang} 
                height="h-64" 
                initialZoom={15} 
              />
            </section>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-white via-white to-transparent pt-10 z-20">
        <button 
          onClick={handleOpenMap}
          className="w-full max-w-xl mx-auto bg-slate-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all"
        >
          <Navigation size={22} className="fill-white" />
          {t.getDirections[lang]}
        </button>
      </div>
    </div>
  );
};

export default DetailsView;
