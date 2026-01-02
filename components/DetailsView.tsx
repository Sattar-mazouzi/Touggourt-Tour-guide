
import React from 'react';
import { Place, Language } from '../types';
import { X, MapPin, Star, Navigation, Share2, Info } from 'lucide-react';
import { translations } from '../i18n';

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

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom duration-300 overflow-y-auto">
      <div className="relative h-[40vh] flex-shrink-0">
        <img 
          src={place.imageUrl} 
          alt={place.name[lang]} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start">
          <button 
            onClick={onClose}
            className="p-2 bg-white/80 backdrop-blur rounded-full shadow-lg"
          >
            <X size={24} />
          </button>
          <div className="flex gap-2">
            <button className="p-2 bg-white/80 backdrop-blur rounded-full shadow-lg">
              <Share2 size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white -mt-6 rounded-t-3xl p-6 shadow-xl relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-orange-500 font-bold text-xs uppercase tracking-wider mb-1 block">
              {t[place.category][lang]}
            </span>
            <h2 className="text-2xl font-bold text-slate-900">{place.name[lang]}</h2>
          </div>
          <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
            <Star size={16} className="text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-bold text-yellow-700">{place.rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 mb-6 pb-6 border-bottom border-slate-100">
          <MapPin size={18} className="text-slate-400" />
          <span className="text-sm">{place.location.address[lang]}</span>
        </div>

        <div className="space-y-6 mb-24">
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Info size={18} className="text-blue-500" />
              {lang === 'en' ? 'About' : 'حول المكان'}
            </h3>
            <p className="text-slate-600 leading-relaxed text-base">
              {place.description[lang]}
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-3">
              {t.map[lang]}
            </h3>
            <div className="w-full h-48 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 overflow-hidden relative group" onClick={handleOpenMap}>
               <img 
                src={`https://maps.googleapis.com/maps/api/staticmap?center=${place.location.lat},${place.location.lng}&zoom=15&size=600x300&markers=color:red%7C${place.location.lat},${place.location.lng}&key=YOUR_API_KEY_HERE`} 
                alt="Static Map" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as any).src = "https://picsum.photos/seed/mapfallback/600/300";
                }}
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all flex items-center justify-center">
                <div className="bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-medium">
                  <Navigation size={18} />
                  {t.getDirections[lang]}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 flex gap-4 z-20">
        <button 
          onClick={handleOpenMap}
          className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Navigation size={20} />
          {t.getDirections[lang]}
        </button>
      </div>
    </div>
  );
};

export default DetailsView;
