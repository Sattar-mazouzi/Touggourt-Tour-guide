
import React, { useMemo, useState } from 'react';
import { 
  ChevronLeft, History, MapPin, Share2, CloudSun, Wind, 
  Palette, Shirt, UtensilsCrossed, Music4, CalendarDays, Dices, Layers, Globe, X
} from 'lucide-react';
import { Language, CityBioData, GalleryItem } from '../types';
import { translations } from '../i18n';

interface Props {
  lang: Language;
  data: CityBioData;
  allGalleryItems: GalleryItem[];
  onClose: () => void;
}

const HeritageItem: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  content: string; 
  colorClass: string 
}> = ({ icon, title, content, colorClass }) => (
  <div className="p-6 rounded-[32px] border border-slate-100 bg-white shadow-sm flex flex-col gap-4 transition-all hover:shadow-md">
    <div className={`w-12 h-12 rounded-2xl ${colorClass} flex items-center justify-center text-white shadow-lg`}>
      {icon}
    </div>
    <div>
      <h4 className="text-lg font-black text-slate-900 mb-2">{title}</h4>
      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
        {content || '...'}
      </p>
    </div>
  </div>
);

const CityArticle: React.FC<Props> = ({ lang, data, allGalleryItems, onClose }) => {
  const [isCoverFullScreen, setIsCoverFullScreen] = useState(false);
  const t = translations;

  const resolvedGalleryItems = useMemo(() => {
    if (!data?.gallery) return [];
    const ids = [
      data.gallery.item1,
      data.gallery.item2,
      data.gallery.item3,
      data.gallery.item4,
      data.gallery.item5
    ].filter(Boolean);
    
    return ids.map(id => allGalleryItems.find(item => item.id === id)).filter(Boolean) as GalleryItem[];
  }, [data, allGalleryItems]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.cityBioTitle[lang],
          text: data.bio[lang],
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing article:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[1300] bg-white flex flex-col h-[100dvh] overflow-hidden animate-in slide-in-from-right duration-300">
      {/* Sticky Top Header */}
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between">
        <button 
          onClick={onClose}
          className="p-2 -ml-2 text-slate-900 hover:bg-slate-50 rounded-full transition-colors flex items-center gap-1"
        >
          <ChevronLeft size={24} className={lang === 'ar' ? 'rotate-180' : ''} />
          <span className="font-bold text-sm">{t.back[lang]}</span>
        </button>
        <div className="flex flex-col items-center flex-1 truncate px-4">
           <h1 className="text-lg font-black text-slate-900 truncate w-full text-center">
            {t.cityBioTitle[lang]}
          </h1>
        </div>
        <button 
          onClick={handleShare}
          className="p-2 text-slate-900 hover:bg-slate-50 rounded-full transition-colors"
        >
          <Share2 size={20} />
        </button>
      </header>

      {/* Main Content Area */}
      <article className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Cover Hero */}
        <div className="relative h-[40vh] w-full cursor-zoom-in" onClick={() => setIsCoverFullScreen(true)}>
          <img 
            src={data.cover} 
            alt={t.cityBioTitle[lang]} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20"></div>
        </div>

        {/* Article Body */}
        <div className="px-6 py-8 max-w-2xl mx-auto space-y-12">
          
          {/* 1. Bio (Intro Section) */}
          <section>
            <p className="text-2xl font-black text-slate-900 mb-6 leading-tight">
              {data.bio[lang]}
            </p>
            <div className="space-y-4 text-slate-600 leading-relaxed text-lg">
              <p>{data.extendedBio[lang]}</p>
            </div>
          </section>

          {/* 2. Location & Geography Section */}
          <section className="bg-slate-50 -mx-6 px-6 py-10 border-y border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <MapPin size={24} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">{t.geography[lang]}</h2>
            </div>
            <div className="text-slate-600 leading-relaxed text-lg mb-8">
              {data.geography[lang] || ''}
            </div>
            {/* Context Map */}
            <div className="rounded-[40px] overflow-hidden border-4 border-white shadow-2xl relative h-64 bg-slate-200">
              <img src={data.location} alt="Map" className="w-full h-full object-cover" />
              <div className="absolute top-[20%] left-[72%] -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-40"></div>
                  <div className="w-4 h-4 bg-orange-600 rounded-full border-2 border-white shadow-lg relative z-10"></div>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {t.algeriaLocation[lang]}
              </div>
            </div>
          </section>

          {/* 3. Historical Glimpse Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                <History size={24} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">{t.history[lang]}</h2>
            </div>
            <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
              <p className="font-bold text-slate-900">{data.histBio[lang]}</p>
              <p>{data.extendedHistBio[lang]}</p>
            </div>
          </section>

          {/* 4. Climate & Topography Section */}
          {data.climateandTopography && (
            <section className="bg-orange-50/30 -mx-6 px-6 py-10 border-y border-orange-100/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                  <CloudSun size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-900">{t.climateAndTopography[lang]}</h2>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-[32px] p-6 shadow-sm border border-orange-100">
                <div className="flex items-start gap-3 mb-4">
                  <Wind className="text-orange-400 mt-1 flex-shrink-0" size={20} />
                  <div className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap">
                    {data.climateandTopography[lang] || ''}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 5. Heritage & Traditions Section */}
          <section className="-mx-6 px-6 py-10 bg-slate-900 text-white border-y border-slate-800">
             <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                  <Palette size={24} />
                </div>
                <h2 className="text-3xl font-black">{t.heritageTitle[lang]}</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <HeritageItem 
                 icon={<Layers size={22} />}
                 title={t.heritageIndustries[lang]}
                 content={data.heritage?.industries?.[lang] || ''}
                 colorClass="bg-indigo-500 shadow-indigo-500/30"
               />
               <HeritageItem 
                 icon={<Shirt size={22} />}
                 title={t.heritageClothing[lang]}
                 content={data.heritage?.clothing?.[lang] || ''}
                 colorClass="bg-rose-500 shadow-rose-500/30"
               />
               <HeritageItem 
                 icon={<UtensilsCrossed size={22} />}
                 title={t.heritageCulinary[lang]}
                 content={data.heritage?.culinaryArts?.[lang] || ''}
                 colorClass="bg-amber-500 shadow-amber-500/30"
               />
               <HeritageItem 
                 icon={<Music4 size={22} />}
                 title={t.heritageFolklore[lang]}
                 content={data.heritage?.folklore?.[lang] || ''}
                 colorClass="bg-emerald-500 shadow-emerald-500/30"
               />
               <HeritageItem 
                 icon={<CalendarDays size={22} />}
                 title={t.heritageFestivals[lang]}
                 content={data.heritage?.festivals?.[lang] || ''}
                 colorClass="bg-blue-500 shadow-blue-500/30"
               />
               <HeritageItem 
                 icon={<Dices size={22} />}
                 title={t.heritageGames[lang]}
                 content={data.heritage?.games?.[lang] || ''}
                 colorClass="bg-purple-500 shadow-purple-500/30"
               />
             </div>
          </section>

          {/* 6. Curiosity Gallery Section */}
          {resolvedGalleryItems.length > 0 && (
            <section>
               <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-600/20">
                  <Globe size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-900">{t.exploreGallery[lang]}</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 {resolvedGalleryItems.map((item, idx) => {
                   // Alternate layout: some items span 2 columns for visual interest
                   const isWide = (idx % 3 === 2) || (resolvedGalleryItems.length === 1);
                   return (
                     <div key={item.id} className={`relative overflow-hidden rounded-[32px] shadow-lg group ${isWide ? 'col-span-2 h-64' : 'h-48'}`}>
                        <img 
                          src={item.images.img1} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          alt={item.title[lang]} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4">
                           <h4 className="text-white font-black text-sm drop-shadow-sm">{item.title[lang]}</h4>
                        </div>
                     </div>
                   );
                 })}
              </div>
            </section>
          )}

          {/* Footer Text */}
          <footer className="pt-8 border-t border-slate-100 text-center">
             <div className="w-12 h-1 bg-orange-500 mx-auto rounded-full mb-6"></div>
             <div className="flex flex-col items-center gap-2">
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                  {t.appName[lang]} &copy; {new Date().getFullYear()}
               </p>
             </div>
          </footer>
        </div>
      </article>

      {/* Full Screen Image Viewer */}
      {isCoverFullScreen && (
        <div 
          className="fixed inset-0 z-[3000] bg-white flex items-center justify-center p-8 animate-in fade-in duration-300"
          onClick={() => setIsCoverFullScreen(false)}
        >
          <button 
            className="absolute top-8 right-8 p-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-full transition-colors border border-slate-200"
            onClick={(e) => {
              e.stopPropagation();
              setIsCoverFullScreen(false);
            }}
          >
            <X size={24} />
          </button>
          <img 
            src={data.cover} 
            alt="Full Cover" 
            className="max-w-full max-h-[80vh] object-contain animate-in zoom-in duration-300 drop-shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

export default CityArticle;
