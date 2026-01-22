
import React from 'react';
import { Place, Language } from '../types';
import { Star, MapPin, Heart } from 'lucide-react';

interface Props {
  place: Place;
  lang: Language;
  onSelect: (place: Place) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const PlaceCard: React.FC<Props> = ({ place, lang, onSelect, isFavorite, onToggleFavorite }) => {
  // Use the cover image from the new object structure
  const displayImage = place.imageUrl?.cover || 'https://images.unsplash.com/photo-1544411047-c4915842273b?q=80&w=800&auto=format&fit=crop';

  return (
    <div 
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 mb-4 group active:scale-[0.98] transition-all"
      onClick={() => onSelect(place)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={displayImage} 
          alt={place.name[lang]} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 flex gap-2">
           <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(place.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-colors ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-black/20 text-white hover:bg-black/40'
            }`}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
          <Star size={14} className="text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-bold text-slate-800">{place.rating}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">
          {place.name[lang]}
        </h3>
        <div className="flex items-center gap-1 text-slate-500 text-sm mb-2">
          <MapPin size={14} />
          <span className="truncate">{place.address?.[lang] || ''}</span>
        </div>
        <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
          {place.description[lang]}
        </p>
      </div>
    </div>
  );
};

export default PlaceCard;
