
import React, { useState, useRef, useEffect } from 'react';
import { GalleryItem, Language } from '../types';
import { X, Play, Youtube, Image as ImageIcon, Share2, Info, Maximize2 } from 'lucide-react';
import { translations } from '../i18n';

interface Props {
  item: GalleryItem;
  lang: Language;
  onClose: () => void;
}

const getYouTubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const VideoCard: React.FC<{ url: string }> = ({ url }) => {
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
      className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-100 group cursor-pointer shadow-md mb-4"
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

const GalleryDetailsView: React.FC<Props> = ({ item, lang, onClose }) => {
  const t = translations;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fullScreenScrollRef = useRef<HTMLDivElement>(null);
  const thumbScrollRef = useRef<HTMLDivElement>(null);
  const fullScreenThumbScrollRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const images = [
    item.images.img1,
    item.images.img2,
    item.images.img3,
    item.images.img4,
    item.images.img5,
  ].filter(Boolean) as string[];

  const videos = [
    item.videos?.video1,
    item.videos?.video2,
    item.videos?.video3,
  ].filter(Boolean) as string[];

  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (isProgrammaticScroll.current) return;
    
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      if (clientWidth > 0) {
        const index = Math.round(scrollLeft / clientWidth);
        if (index !== activeImageIndex) {
          setActiveImageIndex(index);
        }
      }
    }
  };

  // Sync scroll position when entering/exiting full screen
  useEffect(() => {
    const ref = isFullScreen ? fullScreenScrollRef : scrollRef;
    if (ref.current) {
      const width = ref.current.clientWidth;
      if (width > 0) {
        ref.current.scrollLeft = activeImageIndex * width;
      }
    }
  }, [isFullScreen]);

  useEffect(() => {
    const ref = isFullScreen ? fullScreenThumbScrollRef : thumbScrollRef;
    if (ref.current) {
      const activeThumb = ref.current.children[activeImageIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeImageIndex, isFullScreen]);

  const goToImage = (index: number) => {
    if (index === activeImageIndex) return;
    
    isProgrammaticScroll.current = true;
    setActiveImageIndex(index);
    
    const ref = isFullScreen ? fullScreenScrollRef : scrollRef;
    if (ref.current && ref.current.children[index]) {
      ref.current.children[index].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });
    }

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 1000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title[lang],
          url: window.location.href,
        });
      } catch (err) {}
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-white flex flex-col h-[100dvh] overflow-hidden animate-in slide-in-from-bottom duration-300">
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-32">
        {/* Visual Hero Area */}
        <div className="relative h-[50vh] flex-shrink-0 bg-slate-900">
          <div 
            ref={scrollRef} 
            onScroll={() => handleScroll(scrollRef)} 
            className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            onClick={() => setIsFullScreen(true)}
          >
            {images.map((img, idx) => (
              <div key={idx} className="w-full h-full flex-shrink-0 snap-center cursor-zoom-in">
                <img src={img} alt={`${item.title[lang]} ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          
          {/* Close & Share */}
          <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pt-[calc(1rem+env(safe-area-inset-top))] z-20">
            <button onClick={onClose} className="p-2.5 bg-black/20 backdrop-blur-xl text-white rounded-full shadow-lg border border-white/20"><X size={24} /></button>
            <button onClick={handleShare} className="p-2.5 bg-black/20 backdrop-blur-xl text-white rounded-full shadow-lg border border-white/20"><Share2 size={24} /></button>
          </div>

          {/* Indicators / Thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 px-6 z-20">
              <div ref={thumbScrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 snap-x">
                {images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={(e) => {
                      e.stopPropagation();
                      goToImage(idx);
                    }}
                    className={`relative w-16 h-12 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all snap-center ${activeImageIndex === idx ? 'border-orange-500 scale-110 shadow-lg' : 'border-white/50 opacity-60'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Maximize Button Overlay */}
          <div className="absolute bottom-20 right-6 z-20">
            <button onClick={() => setIsFullScreen(true)} className="p-2 bg-black/30 backdrop-blur-md rounded-xl text-white border border-white/10">
              <Maximize2 size={18} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white -mt-8 rounded-t-[40px] p-8 shadow-2xl relative z-10 min-h-[50vh]">
          <h2 className="text-3xl font-black text-slate-900 mb-8 leading-tight">
            {item.title[lang]}
          </h2>

          <div className="space-y-10">
            {/* Description Section */}
            {item.description?.[lang] && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                    <Info size={16} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{t.overview[lang]}</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg font-medium">
                  {item.description[lang]}
                </p>
              </section>
            )}

            {/* Videos Section */}
            {videos.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
                    <Youtube size={20} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{t.videos[lang]}</h3>
                </div>
                <div className="space-y-4">
                  {videos.map((v, i) => <VideoCard key={i} url={v} />)}
                </div>
              </section>
            )}

            {/* Other Images Grid (Thumbnail style) */}
            {images.length > 1 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                    <ImageIcon size={20} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{t.exploreGallery[lang]}</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {images.map((img, i) => (
                    <img 
                      key={i} 
                      src={img} 
                    onClick={() => goToImage(i)}
                    className={`w-full h-32 object-cover rounded-2xl shadow-sm cursor-pointer transition-all border-2 ${activeImageIndex === i ? 'border-orange-500 scale-[1.02]' : 'border-slate-100 hover:border-orange-200'}`} 
                      alt="gallery thumb" 
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Full Screen Image Viewer */}
      {isFullScreen && (
        <div className="fixed inset-0 z-[1100] bg-black flex flex-col animate-in fade-in duration-200">
          <div className="absolute top-0 left-0 w-full p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex justify-between items-center z-[1110]">
             <div className="text-white/60 text-xs font-bold px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/10">
                {activeImageIndex + 1} / {images.length}
             </div>
             <button onClick={() => setIsFullScreen(false)} className="p-3 bg-white/10 backdrop-blur-xl text-white rounded-full border border-white/20">
               <X size={24} />
             </button>
          </div>
          <div 
            ref={fullScreenScrollRef} 
            onScroll={() => handleScroll(fullScreenScrollRef)} 
            className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          >
            {images.map((img, idx) => (
              <div key={idx} className="w-full h-full flex-shrink-0 flex items-center justify-center snap-center p-2">
                <img src={img} alt="full" className="max-w-full max-h-full object-contain" />
              </div>
            ))}
          </div>
          {images.length > 1 && (
            <div className="p-6 bg-black/40 backdrop-blur-xl border-t border-white/10">
              <div ref={fullScreenThumbScrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x justify-center">
                {images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={(e) => {
                      e.stopPropagation();
                      goToImage(idx);
                    }}
                    className={`relative w-20 h-14 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all snap-center ${activeImageIndex === idx ? 'border-orange-500 scale-110 shadow-2xl' : 'border-white/20 opacity-40 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GalleryDetailsView;
