
import React, { useState, useRef, useEffect } from 'react';
import { GalleryItem, Language } from '../types';
import { X, Play, Youtube, Image as ImageIcon, Share2, Info } from 'lucide-react';
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
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      setActiveImageIndex(index);
    }
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
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Visual Hero Area */}
        <div className="relative h-[50vh] flex-shrink-0 bg-slate-900">
          <div 
            ref={scrollRef} 
            onScroll={handleScroll} 
            className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          >
            {images.map((img, idx) => (
              <div key={idx} className="w-full h-full flex-shrink-0 snap-center">
                <img src={img} alt={`${item.title[lang]} ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          
          {/* Close & Share */}
          <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pt-[calc(1rem+env(safe-area-inset-top))] z-20">
            <button onClick={onClose} className="p-2.5 bg-black/20 backdrop-blur-xl text-white rounded-full shadow-lg border border-white/20"><X size={24} /></button>
            <button onClick={handleShare} className="p-2.5 bg-black/20 backdrop-blur-xl text-white rounded-full shadow-lg border border-white/20"><Share2 size={24} /></button>
          </div>

          {/* Indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-1.5 pointer-events-none z-20">
              {images.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${activeImageIndex === idx ? 'w-6 bg-orange-500' : 'w-1.5 bg-white/40'}`} />
              ))}
            </div>
          )}
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
                      onClick={() => {
                        if (scrollRef.current) {
                          scrollRef.current.scrollLeft = i * scrollRef.current.clientWidth;
                        }
                      }}
                      className="w-full h-32 object-cover rounded-2xl shadow-sm cursor-pointer border border-slate-100" 
                      alt="gallery thumb" 
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryDetailsView;
