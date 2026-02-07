
import React, { useState, useRef, useEffect } from 'react';
import { Place, Language, CategoryConfig } from '../types';
import { X, MapPin, Star, Navigation, Share2, Info, Maximize2, Heart, Play, Youtube, Box } from 'lucide-react';
import { translations } from '../i18n';
import MapView from './MapView';
import ReviewSection from './ReviewSection';

interface Props {
  place: Place;
  lang: Language;
  categoryConfig?: CategoryConfig;
  onClose: () => void;
}

const getYouTubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const VideoCard: React.FC<{ url: string; lang: Language }> = ({ url, lang }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = getYouTubeId(url);

  if (!videoId) return null;

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  if (isPlaying) {
    const currentOrigin = window.location.origin;
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(currentOrigin)}`;

    return (
      <div className="w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-lg">
        <iframe
          src={embedUrl}
          className="w-full h-full border-none"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        ></iframe>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-100 group cursor-pointer shadow-md"
      onClick={() => setIsPlaying(true)}
    >
      <img src={thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="YouTube Preview" />
      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
        <div className="w-14 h-14 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-orange-600 shadow-2xl group-hover:scale-110 transition-transform">
          <Play size={28} className="fill-current ml-1" />
        </div>
      </div>
      <div className="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur text-white rounded-full">
        <Youtube size={16} />
      </div>
    </div>
  );
};

const DetailsView: React.FC<Props> = ({ place, lang, categoryConfig, onClose }) => {
  const t = translations;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [is3DOpen, setIs3DOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fullScreenScrollRef = useRef<HTMLDivElement>(null);

  const images = [
    place.imageUrl.cover,
    place.imageUrl.img1,
    place.imageUrl.img2,
    place.imageUrl.img3,
    place.imageUrl.img4,
    place.imageUrl.img5,
  ].filter(Boolean) as string[];

  const videos = [
    place.videoUrls?.video1,
    place.videoUrls?.video2,
    place.videoUrls?.video3,
  ].filter(Boolean) as string[];

  const threeDImage = place.imageUrl?.['3d_img'];

  const t3D = {
    en: 'See 3D visualization',
    ar: 'رؤية التصور ثلاثي الأبعاد',
    fr: 'Voir la visualisation 3D'
  };

  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>, setter: (i: number) => void) => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const index = Math.round(scrollLeft / clientWidth);
      setter(index);
    }
  };

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

  const categoryLabel = categoryConfig?.[place.category]?.[lang] || t[place.category]?.[lang] || place.category;

  return (
    <div className="fixed inset-0 z-[1000] bg-white flex flex-col h-[100dvh] overflow-hidden animate-in slide-in-from-bottom duration-300">
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-32">
        <div className="relative h-[45vh] flex-shrink-0 bg-slate-900 group">
          <div ref={scrollRef} onScroll={() => handleScroll(scrollRef, setActiveImageIndex)} className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide" onClick={() => setIsFullScreen(true)}>
            {images.map((img, idx) => (
              <div key={idx} className="w-full h-full flex-shrink-0 snap-center cursor-zoom-in">
                <img src={img} alt={`${place.name[lang]} ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-1.5 pointer-events-none z-20">
              {images.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${activeImageIndex === idx ? 'w-6 bg-white shadow-sm' : 'w-1.5 bg-white/40'}`} />
              ))}
            </div>
          )}
          <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pt-[calc(1rem+env(safe-area-inset-top))] z-20">
            <button onClick={onClose} className="p-2.5 bg-white/80 backdrop-blur-xl rounded-full shadow-lg border border-white/50"><X size={24} /></button>
            <button onClick={handleShare} className="p-2.5 bg-white/80 backdrop-blur-xl rounded-full shadow-lg border border-white/50"><Share2 size={24} /></button>
          </div>
          <div className="absolute bottom-10 left-6 right-6 z-10 pointer-events-none">
            <div className="bg-black/20 backdrop-blur-sm p-4 rounded-3xl -mx-2">
              <span className="inline-block bg-orange-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-2">{categoryLabel}</span>
              <h2 className="text-3xl font-black text-white drop-shadow-md leading-tight">{place.name[lang]}</h2>
            </div>
          </div>
        </div>

        <div className="bg-white -mt-8 rounded-t-[40px] p-8 shadow-2xl relative z-10 min-h-[60vh]">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2 text-slate-500 max-w-[50%]">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0"><MapPin size={20} className="text-orange-500" /></div>
              <span className="text-sm font-bold leading-tight truncate">{place.address?.[lang] || ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-2 rounded-2xl border border-yellow-200">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-black text-yellow-700">{place.rating}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-red-50 px-3 py-2 rounded-2xl border border-red-100">
                <Heart size={14} className="text-red-500 fill-red-500" />
                <span className="text-xs font-black text-red-700">{place.favoritesCount || 0}</span>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center"><Info size={16} className="text-blue-500" /></div>
                  {t.overview[lang]}
                </h3>
                {threeDImage && (
                  <button 
                    onClick={() => setIs3DOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-indigo-100 shadow-sm active:scale-95 transition-all"
                  >
                    <Box size={14} />
                    {t3D[lang]}
                  </button>
                )}
              </div>
              <p className="text-slate-600 leading-relaxed text-lg font-medium">{place.description[lang]}</p>
            </section>

            {videos.length > 0 && (
              <section>
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center"><Youtube size={16} className="text-red-500" /></div>
                  {t.videos[lang]}
                </h3>
                <div className="space-y-6">
                  {videos.map((v, i) => <VideoCard key={i} url={v} lang={lang} />)}
                </div>
              </section>
            )}

            <section>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900">{t.map[lang]}</h3>
                <button onClick={handleOpenMap} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">{t.getDirections[lang]} <Navigation size={14} /></button>
              </div>
              <MapView places={[place]} lang={lang} height="h-72" initialZoom={15} />
            </section>

            <ReviewSection placeId={place.id} lang={lang} />
          </div>
        </div>
      </div>

      {isFullScreen && (
        <div className="fixed inset-0 z-[1100] bg-black flex flex-col animate-in fade-in duration-200">
          <div className="absolute top-0 left-0 w-full p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex justify-end z-[1110]">
            <button onClick={() => setIsFullScreen(false)} className="p-3 bg-white/10 backdrop-blur-xl text-white rounded-full"><X size={24} /></button>
          </div>
          <div ref={fullScreenScrollRef} onScroll={() => handleScroll(fullScreenScrollRef, setActiveImageIndex)} className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            {images.map((img, idx) => (
              <div key={idx} className="w-full h-full flex-shrink-0 flex items-center justify-center snap-center p-2"><img src={img} alt="full" className="max-w-full max-h-full object-contain" /></div>
            ))}
          </div>
        </div>
      )}

      {/* 3D Visualizer Modal */}
      {is3DOpen && threeDImage && (
        <div 
          className="fixed inset-0 z-[3000] bg-white flex flex-col animate-in fade-in duration-300"
          onClick={() => setIs3DOpen(false)}
        >
          <div className="flex-shrink-0 p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex justify-between items-center z-10 border-b border-slate-100">
             <div className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                <Box size={14} />
                3D Visualization
             </div>
             <button 
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-full transition-colors border border-slate-200"
              onClick={(e) => {
                e.stopPropagation();
                setIs3DOpen(false);
              }}
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 w-full h-full flex items-center justify-center bg-slate-50 p-6 overflow-hidden">
            <img 
              src={threeDImage} 
              alt="3D View" 
              className="max-w-full max-h-[85vh] object-contain animate-in zoom-in duration-500 drop-shadow-2xl"
            />
          </div>
          <div className="p-6 text-center bg-white border-t border-slate-50">
            <h4 className="text-slate-900 font-black text-lg mb-1">{place.name[lang]}</h4>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">{lang === 'ar' ? 'نموذج ثلاثي الأبعاد تم إنشاؤه' : 'Generated 3D Model'}</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 w-full p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-white via-white/80 to-transparent pt-12 z-20">
        <button onClick={handleOpenMap} className="w-full max-w-xl mx-auto bg-slate-900 text-white py-5 rounded-[24px] font-black text-lg flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98] transition-all"><Navigation size={22} className="fill-white" />{t.getDirections[lang]}</button>
      </div>
    </div>
  );
};

export default DetailsView;
