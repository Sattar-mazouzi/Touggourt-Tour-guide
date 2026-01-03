
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
    window.open(`https://www.google.com/maps/search/?api=1&query=${place.location.lat},${place.location.lng}`, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: place.name[lang],
          text: place.description[lang],
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom duration-300 overflow-y-auto scrollbar-hide">
      {/* Hero Image Section */}
      <div className="relative h-[45vh] flex-shrink-0">
        <img 
          src={place.imageUrl} 
          alt={place.name[lang]} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start">
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
            {t[place.category][lang]}
          </span>
          <h2 className="text-3xl font-black text-white drop-shadow-md">{place.name[lang]}</h2>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 bg-white -mt-8 rounded-t-[40px] p-8 shadow-2xl relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-slate-500">
            <MapPin size={20} className="text-orange-500" />
            <span className="text-sm font-medium">{place.location.address[lang]}</span>
          </div>
          <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-2xl border border-yellow-200">
            <Star size={16} className="text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-bold text-yellow-700">{place.rating}</span>
          </div>
        </div>

        <div className="space-y-8 mb-32">
          {/* About Section */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Info size={20} className="text-blue-500" />
              {lang === 'en' ? 'Overview' : 'نظرة عامة'}
            </h3>
            <p className="text-slate-600 leading-relaxed text-base">
              {place.description[lang]}
            </p>
          </section>

          {/* Location Map Section */}
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
            
            {/* Embedded Interactive Map */}
            <MapView 
              places={[place]} 
              lang={lang} 
              height="h-64" 
              initialZoom={15} 
            />
          </section>
        </div>
      </div>

      {/* Bottom Sticky Action Button */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-white via-white to-transparent pt-10 z-20">
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
