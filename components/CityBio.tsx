
import React, { useState } from 'react';
import { X, MapPin, History, Globe, Users, CloudSun, ChevronDown, ChevronUp, Sparkles, Loader2 } from 'lucide-react';
import { Language, CityBioData } from '../types';
import { translations } from '../i18n';

interface Props {
  lang: Language;
  data: CityBioData | null;
  onClose: () => void;
}

const CITY_COVER_IMAGE = "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=1200&auto=format&fit=crop";

const CityBio: React.FC<Props> = ({ lang, data, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const t = translations;

  if (!data) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <div className="bg-white w-full max-w-lg rounded-[40px] p-12 flex flex-col items-center justify-center gap-4">
           <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
           <p className="font-bold text-slate-400 uppercase tracking-widest text-sm text-center">
             {lang === 'ar' ? 'تحميل معلومات المدينة...' : (lang === 'fr' ? 'Chargement...' : 'Loading City Info...')}
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
            src={CITY_COVER_IMAGE} 
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
              {lang === 'ar' ? 'مدينة الواحات' : (lang === 'fr' ? 'Ville Oasis' : 'Oasis City')}
            </span>
            <h2 className="text-4xl font-black text-slate-900 drop-shadow-sm leading-tight">
              {t.cityBioTitle[lang]}
            </h2>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 pt-2 scrollbar-hide space-y-8">
          
          {/* Main Description with Expansion */}
          <div className="relative pt-4">
             <div className={`absolute ${lang === 'ar' ? '-right-2' : '-left-2'} top-4 bottom-0 w-1 bg-orange-500 rounded-full opacity-20`}></div>
             <div className={lang === 'ar' ? 'pr-4' : 'pl-4'}>
               <p className="text-slate-600 font-medium leading-relaxed italic text-lg mb-3">
                  "{data.bio[lang]}"
               </p>
               
               <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                 <p className="text-slate-500 text-sm leading-relaxed mb-4">
                   {data.extendedBio[lang]}
                 </p>
               </div>

               <button 
                 onClick={() => setIsExpanded(!isExpanded)}
                 className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-widest hover:text-orange-700 transition-colors"
               >
                 {isExpanded ? t.readLess[lang] : t.readMore[lang]}
                 {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
               </button>
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
                  <img src={img.url} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" alt={img.title[lang]} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <span className="absolute bottom-2 left-3 right-3 text-[10px] font-bold text-white truncate">
                    {img.title[lang]}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <Users size={18} className="text-orange-500 mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'السكان' : (lang === 'fr' ? 'Population' : 'Population')}</p>
                <p className="text-sm font-black text-slate-800">
                  {data.population || (lang === 'ar' ? 'غير متوفر' : 'N/A')}
                </p>
             </div>
             <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <CloudSun size={18} className="text-amber-500 mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'المناخ' : (lang === 'fr' ? 'Climat' : 'Climate')}</p>
                <p className="text-sm font-black text-slate-800">{data.climate[lang]}</p>
             </div>
          </div>

          <div className="space-y-8">
            <section className="flex gap-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0 shadow-inner">
                <MapPin size={24} className="text-blue-500" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 mb-1.5 text-lg">{lang === 'ar' ? 'الموقع والجغرافيا' : (lang === 'fr' ? 'Géographie' : 'Location & Geography')}</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {data.geography[lang]}
                </p>
              </div>
            </section>

            <section className="flex gap-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0 shadow-inner">
                <History size={24} className="text-amber-500" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 mb-1.5 text-lg">{lang === 'ar' ? 'لمحة تاريخية' : (lang === 'fr' ? 'Histoire' : 'Historical Glimpse')}</h4>
                <div className="space-y-2">
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    {data.histBio[lang]}
                  </p>
                  
                  <div className={`overflow-hidden transition-all duration-500 ${isHistoryExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium border-t border-slate-100 pt-2 mt-2">
                      {data.extendedHistBio[lang]}
                    </p>
                  </div>

                  <button 
                    onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                    className="flex items-center gap-1.5 text-amber-600 font-bold text-[10px] uppercase tracking-wider hover:text-amber-700 transition-colors"
                  >
                    {isHistoryExpanded ? t.readLess[lang] : t.readMore[lang]}
                    {isHistoryExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                </div>
              </div>
            </section>

            {/* Context Map Visualization - Using Dynamic Image from Firestore */}
            <section className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Globe size={20} className="text-slate-400" />
                  <h4 className="font-black text-slate-900">{t.algeriaLocation[lang]}</h4>
                </div>
                <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 tracking-tighter">
                  {lang === 'ar' ? 'شمال أفريقيا' : (lang === 'fr' ? 'AFRIQUE DU NORD' : 'NORTH AFRICA')}
                </div>
              </div>
              <div className="h-64 rounded-[32px] overflow-hidden border border-slate-200 shadow-inner relative group/map">
                <img 
                  src={data.location} 
                  alt="Map of Touggourt location in Algeria" 
                  className="w-full h-full object-cover transition-all duration-700 group-hover/map:scale-105"
                />
                <div className="absolute inset-0 bg-slate-900/10 pointer-events-none"></div>
                
                {/* Visual Pin Overlay */}
                <div className="absolute top-[35%] left-[55%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                   <div className="relative">
                      <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-40"></div>
                      <div className="w-4 h-4 bg-orange-600 rounded-full border-2 border-white shadow-lg relative z-10"></div>
                   </div>
                   <div className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-black text-slate-800 border border-white shadow-xl whitespace-nowrap">
                      {lang === 'ar' ? 'تقرت' : (lang === 'fr' ? 'Touggourt' : 'Touggourt')}
                   </div>
                </div>

                <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5 rounded-[32px]"></div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="px-8 pb-8 pt-4 bg-white/80 backdrop-blur-md border-t border-slate-50 flex-shrink-0">
          <button 
            onClick={onClose}
            className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-lg shadow-2xl shadow-slate-900/20 active:scale-[0.97] transition-all hover:bg-orange-600 hover:shadow-orange-500/20"
          >
            {t.startExploring[lang]}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CityBio;
