
import React from 'react';
import { X, Users, CloudSun, Sparkles, Loader2, BookOpen } from 'lucide-react';
import { Language, CityBioData } from '../types';
import { translations } from '../i18n';

interface Props {
  lang: Language;
  data: CityBioData | null;
  onClose: () => void;
  onOpenArticle: () => void;
}

const DEFAULT_COVER = "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=1200&auto=format&fit=crop";

const CityBio: React.FC<Props> = ({ lang, data, onClose, onOpenArticle }) => {
  const t = translations;

  if (!data) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <div className="bg-white w-full max-w-lg rounded-[40px] p-12 flex flex-col items-center justify-center gap-4">
           <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
           <p className="font-bold text-slate-400 uppercase tracking-widest text-sm text-center">
             {t.loadingCityInfo[lang]}
           </p>
        </div>
      </div>
    );
  }

  const galleryItems = [
    { url: data.gallery.architecture, title: { en: "Architecture", ar: "العمارة", fr: "Architecture" } },
    { url: data.gallery.camel, title: { en: "Camels", ar: "الجمال", fr: "Chameaux" } },
    { url: data.gallery.dunes, title: { en: "Dunes", ar: "الكثبان", fr: "Dunes" } },
    { url: data.gallery.oasis, title: { en: "Oasis", ar: "الواحات", fr: "Oasis" } },
    { url: data.gallery.culture, title: { en: "Culture", ar: "الثقافة", fr: "Culture" } },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden flex flex-col max-h-[92vh] shadow-2xl animate-in slide-in-from-bottom-12 duration-500 ring-1 ring-black/5">
        
        {/* Header Image Section */}
        <div className="relative h-64 flex-shrink-0 group">
          <img 
            src={data.cover || DEFAULT_COVER} 
            alt="Touggourt City View"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/40"></div>
          
          <button 
            onClick={onClose}
            className={`absolute top-6 ${lang === 'ar' ? 'left-6' : 'right-6'} p-2.5 bg-black/20 backdrop-blur-xl text-white rounded-full hover:bg-black/40 transition-all border border-white/20 active:scale-90`}
          >
            <X size={20} />
          </button>

          <div className={`absolute bottom-8 ${lang === 'ar' ? 'right-8' : 'left-8'} right-8`}>
            <span className="inline-block px-3 py-1 bg-orange-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-3 shadow-lg shadow-orange-500/30">
              {t.wadiRigh[lang]}
            </span>
            <h2 className="text-4xl font-black text-slate-900 drop-shadow-sm leading-tight">
              {t.cityBioTitle[lang]}
            </h2>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 pt-2 scrollbar-hide space-y-8">
          
          {/* Brief Description */}
          <div className="relative pt-4">
             <div className={`absolute ${lang === 'ar' ? '-right-2' : '-left-2'} top-4 bottom-0 w-1 bg-orange-500 rounded-full opacity-20`}></div>
             <div className={lang === 'ar' ? 'pr-4' : 'pl-4'}>
               <p className="text-slate-600 font-medium leading-relaxed italic text-lg mb-3">
                  "{data.bio[lang] || ''}"
               </p>
               
               <div className="flex items-center justify-between">
                  <button 
                    onClick={onOpenArticle}
                    className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-widest hover:text-orange-700 transition-colors"
                  >
                    {t.readMore[lang]}
                    <BookOpen size={14} />
                  </button>
               </div>
             </div>
          </div>

          {/* Curiosity Gallery Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={20} className="text-orange-500" />
              <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight">{t.exploreGallery[lang]}</h4>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2 snap-x">
              {galleryItems.map((img, i) => (
                <div key={i} className="min-w-[160px] h-32 rounded-2xl overflow-hidden relative group/item snap-center shadow-md">
                  <img src={img.url} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" alt={img.title[lang] || ''} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <span className="absolute bottom-2 left-3 right-3 text-[10px] font-bold text-white truncate">
                    {img.title[lang] || ''}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={18} className="text-orange-500" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.population[lang]}</p>
                </div>
                <p className="text-sm font-black text-slate-800">
                  {data.population || t.notAvailable[lang]}
                </p>
             </div>
             <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <CloudSun size={18} className="text-amber-500" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.climate[lang]}</p>
                </div>
                <p className="text-sm font-black text-slate-800">
                  {data.climate[lang] || ''}
                </p>
             </div>
          </div>
        </div>

        {/* Footer Action Bar with Two Buttons */}
        <div className="px-8 pb-8 pt-4 bg-white/80 backdrop-blur-md border-t border-slate-50 flex-shrink-0">
          <div className="flex gap-3">
            <button 
              onClick={onOpenArticle}
              className="flex-1 py-5 bg-white border-2 border-slate-900 text-slate-900 rounded-3xl font-black text-base shadow-lg active:scale-[0.97] transition-all flex items-center justify-center gap-2"
            >
              <BookOpen size={20} />
              {t.readMore[lang]}
            </button>
            <button 
              onClick={onClose}
              className="flex-[1.5] py-5 bg-slate-900 text-white rounded-3xl font-black text-base shadow-2xl shadow-slate-900/20 active:scale-[0.97] transition-all hover:bg-orange-600 hover:shadow-orange-500/20 flex items-center justify-center"
            >
              {t.startExploring[lang]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityBio;
