
import React, { useState, useRef, useEffect } from 'react';
import { Place, Language } from '../types';
import { X, MapPin, Star, Navigation, Share2, Info, Maximize2 } from 'lucide-react';
import { translations } from '../i18n';
import MapView from './MapView';

interface Props {
  place: Place;
  lang: Language;
  onClose: () => void;
}

const DetailsView: React.FC<Props> = ({ place, lang, onClose }) => {
  const t = translations;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fullScreenScrollRef = useRef<HTMLDivElement>(null);

  // Collect all available images
  const images = [
    place.imageUrl.cover,
    place.imageUrl.img1,
    place.imageUrl.img2,
    place.imageUrl.img3,
    place.imageUrl.img4,
    place.imageUrl.img5,
  ].filter(Boolean) as string[];

  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>, setter: (i: number) => void) => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const index = Math.round(scrollLeft / clientWidth);
      setter(index);
    }
  };

  // Sync scroll positions when toggling full screen
  useEffect(() => {
    if (isFullScreen && fullScreenScrollRef.current) {
      const width = fullScreenScrollRef.current.clientWidth;
      fullScreenScrollRef.current.scrollLeft = activeImageIndex * width;
    } else if (!isFullScreen && scrollRef.current) {
      const width = scrollRef.current.clientWidth;
      scrollRef.current.scrollLeft = activeImageIndex * width;
    }
  }, [isFullScreen, activeImageIndex]);

  const handleOpenMap = () => {
    if (!place.location || typeof place.location.lat !== 'number' || typeof place.location.lng !== 'number') return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`;
    window.open(url, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: place.name[lang],
          text: place.description[lang],
          url: window.location.href,
        });
      } catch (err) {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col h-[100dvh] overflow-hidden animate-in slide-in-from-bottom duration-300">
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-32">
        {/* Carousel Header Section */}
        <div className="relative h-[45vh] flex-shrink-0 bg-slate-900 group">
          <div 
            ref={scrollRef}
            onScroll={() => handleScroll(scrollRef, setActiveImageIndex)}
            className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide overscroll-x-contain"
            onClick={() => setIsFullScreen(true)}
          >
            {images.map((img, idx) => (
              <div key={idx} className="w-full h-full flex-shrink-0 snap-center cursor-zoom-in">
                <img 
                  src={img} 
                  alt={`${place.name[lang]} ${idx + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Enlarge Hint */}
          <div className="absolute bottom-16 right-6 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/40 backdrop-blur-md p-2 rounded-full text-white">
              <Maximize2 size={16} />
            </div>
          </div>

          {/* Carousel Indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-1.5 pointer-events-none z-20">
              {images.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeImageIndex === idx ? 'w-6 bg-white shadow-sm' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pt-[calc(1rem+env(safe-area-inset-top))] z-20">
            <button 
              onClick={onClose}
              className="p-2.5 bg-white/80 backdrop-blur-xl rounded-full shadow-lg active:scale-90 transition-transform border border-white/50"
            >
              <X size={24} className="text-slate-900" />
            </button>
            <button 
              onClick={handleShare}
              className="p-2.5 bg-white/80 backdrop-blur-xl rounded-full shadow-lg active:scale-90 transition-transform border border-white/50"
            >
              <Share2 size={24} className="text-slate-900" />
            </button>
          </div>
          
          {/* Title Overlay */}
          <div className="absolute bottom-10 left-6 right-6 z-10 pointer-events-none">
            <div className="bg-black/20 backdrop-blur-sm p-4 rounded-3xl -mx-2">
              <span className="inline-block bg-orange-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-2 shadow-lg shadow-orange-500/20">
                {t[place.category]?.[lang] || place.category}
              </span>
              <h2 className="text-3xl font-black text-white drop-shadow-md leading-tight">{place.name[lang]}</h2>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        </div>

        {/* Content Body */}
        <div className="bg-white -mt-8 rounded-t-[40px] p-8 shadow-2xl relative z-10 min-h-[60vh]">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2 text-slate-500 max-w-[70%]">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <MapPin size={20} className="text-orange-500" />
              </div>
              <span className="text-sm font-bold leading-tight">{place.address?.[lang] || ''}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-yellow-50 px-4 py-2 rounded-2xl border border-yellow-200 shadow-sm">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-black text-yellow-700">{place.rating}</span>
            </div>
          </div>

          <div className="space-y-10">
            <section>
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center"><Info size={16} className="text-blue-500" /></div>
                {t.overview[lang]}
              </h3>
              <p className="text-slate-600 leading-relaxed text-lg font-medium">
                {place.description[lang]}
              </p>
            </section>

            <section>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900">
                  {t.map[lang]}
                </h3>
                <button 
                  onClick={handleOpenMap}
                  className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 active:bg-slate-200 transition-colors"
                >
                  {t.getDirections[lang]} <Navigation size={14} />
                </button>
              </div>
              
              <MapView 
                places={[place]} 
                lang={lang} 
                height="h-72" 
                initialZoom={15} 
              />
            </section>
          </div>
        </div>
      </div>

      {/* Full Screen Image Gallery Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-200">
          <div className="absolute top-0 left-0 w-full p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex justify-end z-[110]">
            <button 
              onClick={() => setIsFullScreen(false)}
              className="p-3 bg-white/10 backdrop-blur-xl text-white rounded-full hover:bg-white/20 transition-all border border-white/10 active:scale-90"
            >
              <X size={24} />
            </button>
          </div>

          <div 
            ref={fullScreenScrollRef}
            onScroll={() => handleScroll(fullScreenScrollRef, setActiveImageIndex)}
            className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          >
            {images.map((img, idx) => (
              <div key={idx} className="w-full h-full flex-shrink-0 flex items-center justify-center snap-center p-2">
                <img 
                  src={img} 
                  alt={`${place.name[lang]} full ${idx + 1}`} 
                  className="max-w-full max-h-full object-contain shadow-2xl"
                />
              </div>
            ))}
          </div>

          <div className="p-8 pb-[calc(2rem+env(safe-area-inset-bottom))] flex flex-col items-center gap-4">
             <div className="flex gap-2">
                {images.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      activeImageIndex === idx ? 'w-8 bg-orange-500' : 'w-2 bg-white/20'
                    }`}
                  />
                ))}
             </div>
             <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
               {activeImageIndex + 1} / {images.length}
             </p>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="absolute bottom-0 left-0 w-full p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-white via-white/80 to-transparent pt-12 z-20">
        <button 
          onClick={handleOpenMap}
          className="w-full max-w-xl mx-auto bg-slate-900 text-white py-5 rounded-[24px] font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/40 active:scale-[0.98] transition-all"
        >
          <Navigation size={22} className="fill-white" />
          {t.getDirections[lang]}
        </button>
      </div>
    </div>
  );
};

export default DetailsView;
