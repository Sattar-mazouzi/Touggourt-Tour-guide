
import React, { useState, useRef } from 'react';
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
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const images = [
    place.imageUrl.cover,
    place.imageUrl.img1,
    place.imageUrl.img2,
    place.imageUrl.img3,
    place.imageUrl.img4,
    place.imageUrl.img5,
  ].filter(Boolean) as string[];

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    }
  };

  return (
    <div 
      className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 mb-6 group active:scale-[0.98] transition-all"
      onClick={() => onSelect(place)}
    >
      <div className="relative h-56 overflow-hidden">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide overscroll-x-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {images.map((img, idx) => (
            <div key={idx} className="w-full h-full flex-shrink-0 snap-center">
              <img 
                src={img} 
                alt={`${place.name[lang]} ${idx + 1}`} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            {images.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeIndex === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}

        <div className={`absolute top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} z-10`}>
           <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(place.id);
            }}
            className={`p-3 rounded-2xl backdrop-blur-xl transition-all shadow-lg border border-white/20 ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-black/20 text-white hover:bg-black/40'
            }`}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className={`absolute top-4 ${lang === 'ar' ? 'right-4' : 'left-4'} z-10 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-sm border border-white/50`}>
          <Star size={14} className="text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-black text-slate-800">{place.rating}</span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">
          {place.name[lang]}
        </h3>
        <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-3">
          <MapPin size={16} className="text-orange-500" />
          <span className="font-medium truncate">{place.address?.[lang] || ''}</span>
        </div>
        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed font-medium">
          {place.description[lang]}
        </p>
      </div>
    </div>
  );
};

export default PlaceCard;
