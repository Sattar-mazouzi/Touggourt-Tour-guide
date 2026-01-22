
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Map as MapIcon, Heart, Home, Compass, Menu, List, Sparkles, Landmark, Loader2, Key } from 'lucide-react';
import { db, analytics } from './firebase.ts';
import { logEvent } from 'firebase/analytics';
import { collection, getDocs } from 'firebase/firestore';
import { Place, Language, Category, CityBioData } from './types.ts';
import { translations } from './i18n.ts';
import PlaceCard from './components/PlaceCard.tsx';
import DetailsView from './components/DetailsView.tsx';
import LanguageSwitcher from './components/LanguageSwitcher.tsx';
import MapView from './components/MapView.tsx';
import CityBio from './components/CityBio.tsx';
import CityArticle from './components/CityArticle.tsx';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'favorites'>('home');
  const [exploreMode, setExploreMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isBioOpen, setIsBioOpen] = useState(false);
  const [isArticleOpen, setIsArticleOpen] = useState(false);
  
  const [places, setPlaces] = useState<Place[]>([]);
  const [cityBio, setCityBio] = useState<CityBioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasApiKey, setHasApiKey] = useState(!!process.env.API_KEY);

  const t = translations;

  // Normalizes category strings from various sources to standard types
  const normalizeCategory = (cat: any): Category => {
    if (!cat) return 'all';
    const c = String(cat).toLowerCase().trim();
    if (c === 'nature' || c === 'natural' || c === 'طبيعي' || c === 'naturel') return 'natural';
    if (c === 'history' || c === 'historical' || c === 'تاريخي' || c === 'historique') return 'historical';
    if (c === 'religion' || c === 'religious' || c === 'ديني' || c === 'religieux') return 'religion';
    if (c === 'culture' || c === 'cultural' || c === 'ثقافي' || c === 'culturel') return 'cultural';
    if (c === 'hotel' || c === 'hotels' || c === 'فنادق' || c === 'hôtels') return 'hotels';
    if (c === 'restaurant' || c === 'restaurants' || c === 'مطاعم') return 'restaurants';
    return c as Category;
  };

  useEffect(() => {
    logEvent(analytics, 'screen_view', {
      firebase_screen: activeTab,
      firebase_screen_class: 'App'
    });
  }, [activeTab]);

  const checkKey = useCallback(async () => {
    if ((window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      setHasApiKey(hasKey || !!process.env.API_KEY);
      return hasKey;
    }
    return !!process.env.API_KEY;
  }, []);

  useEffect(() => {
    checkKey();
  }, [checkKey]);

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
      logEvent(analytics, 'api_key_selected');
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const placesSnapshot = await getDocs(collection(db, "places"));
      const fetchedPlaces = placesSnapshot.docs.map(doc => {
        const data = doc.data();
        
        let imgObj: any = { cover: 'https://images.unsplash.com/photo-1544411047-c4915842273b?q=80&w=800&auto=format&fit=crop' };
        
        if (typeof data.imageUrl === 'string') {
          imgObj.cover = data.imageUrl;
        } else if (data.imageUrl && typeof data.imageUrl === 'object') {
          imgObj = { ...data.imageUrl };
        }

        return {
          id: doc.id,
          name: data.name || { en: 'Unnamed', ar: 'غير مسمى', fr: 'Sans nom' },
          description: data.description || { en: '', ar: '', fr: '' },
          category: normalizeCategory(data.category),
          rating: Number(data.rating) || 0,
          imageUrl: imgObj,
          featured: !!data.featured,
          location: {
            lat: data.location?.lat || 33.1064,
            lng: data.location?.lng || 6.0628,
          },
          address: data.address || { en: 'No address', ar: 'لا يوجد عنوان', fr: 'Aucune adresse' }
        };
      }) as Place[];
      setPlaces(fetchedPlaces);

      const bioSnapshot = await getDocs(collection(db, "aboutCity"));
      let mergedBioData: any = {};
      bioSnapshot.forEach(doc => {
        const data = doc.data();
        mergedBioData = { ...mergedBioData, ...data };
      });

      if (Object.keys(mergedBioData).length > 0) {
        setCityBio(mergedBioData as CityBioData);
      }
    } catch (error) {
      console.error("Firestore loading error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('touggourt_favs');
    if (saved) setFavorites(JSON.parse(saved));
    fetchData();
  }, [fetchData]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const isAdding = !prev.includes(id);
      const updated = isAdding ? [...prev, id] : prev.filter(f => f !== id);
      localStorage.setItem('touggourt_favs', JSON.stringify(updated));
      return updated;
    });
  };

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
  };

  const filteredPlaces = useMemo(() => {
    const queryStr = searchQuery.toLowerCase();
    return places.filter(p => {
      const nameInLang = p.name[lang] || '';
      const descInLang = p.description[lang] || '';
      const matchesSearch = nameInLang.toLowerCase().includes(queryStr) || descInLang.toLowerCase().includes(queryStr);
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const isFav = activeTab === 'favorites' ? favorites.includes(p.id) : true;
      return matchesSearch && matchesCategory && isFav;
    });
  }, [searchQuery, selectedCategory, activeTab, favorites, places, lang]);

  const featuredPlaces = useMemo(() => places.filter(p => p.featured), [places]);
  const categories: Category[] = ['all', 'religion', 'historical', 'cultural', 'natural', 'hotels', 'restaurants'];

  return (
    <div className={`h-[100dvh] flex flex-col overflow-hidden bg-slate-50 ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 pt-[calc(1rem+env(safe-area-inset-top))] relative z-50">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-orange-500/20">T</div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-tight">{t.appName[lang]}</h1>
              <p className="text-[10px] uppercase tracking-widest text-orange-600 font-black">{lang === 'ar' ? 'الجزائر' : (lang === 'fr' ? 'Algérie' : 'Algeria')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!hasApiKey && (window as any).aistudio && (
              <button onClick={handleSelectKey} className="p-2 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 transition-colors">
                <Key size={20} />
              </button>
            )}
            <LanguageSwitcher current={lang} onChange={setLang} />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-xl mx-auto p-4 pb-32">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
              <p className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">{t.loading[lang]}</p>
            </div>
          ) : (
            <>
              <div className="relative mb-6 group">
                <Search className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors`} size={20} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder[lang]}
                  className={`w-full ${lang === 'ar' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'} py-4 bg-white border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all shadow-sm font-bold text-slate-700`}
                />
              </div>

              {activeTab === 'explore' && (
                <div className="flex justify-center mb-6">
                  <div className="bg-slate-100 p-1.5 rounded-3xl flex gap-1.5 w-full max-w-[240px] shadow-inner border border-slate-200">
                    <button onClick={() => setExploreMode('list')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${exploreMode === 'list' ? 'bg-white shadow-md text-orange-600' : 'text-slate-400'}`}>
                      <List size={16} /> {t.list[lang]}
                    </button>
                    <button onClick={() => setExploreMode('map')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${exploreMode === 'map' ? 'bg-white shadow-md text-orange-600' : 'text-slate-400'}`}>
                      <MapIcon size={16} /> {t.map[lang]}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2 overflow-x-auto pb-6 mb-2 scrollbar-hide -mx-4 px-4">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                      selectedCategory === cat 
                        ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' 
                        : 'bg-white text-slate-500 border border-slate-200 hover:border-orange-500 hover:text-orange-500'
                    }`}
                  >
                    {t[cat][lang]}
                  </button>
                ))}
              </div>

              {activeTab === 'explore' && exploreMode === 'map' ? (
                <div className="animate-in fade-in duration-500">
                  <MapView places={filteredPlaces} lang={lang} onSelectPlace={handlePlaceSelect} />
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPlaces.length > 0 ? (
                    filteredPlaces.map(place => (
                      <PlaceCard 
                        key={place.id} 
                        place={place} 
                        lang={lang} 
                        onSelect={handlePlaceSelect}
                        isFavorite={favorites.includes(place.id)}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))
                  ) : (
                    <div className="py-24 text-center text-slate-400">
                      <Compass size={48} className="mx-auto mb-4 opacity-10" />
                      <p className="font-black text-sm uppercase tracking-widest">{t.noPlacesFound[lang]}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <nav className="flex-shrink-0 bg-white/90 backdrop-blur-2xl border-t border-slate-100 pb-[calc(1rem+env(safe-area-inset-bottom))] p-4 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-xl mx-auto flex justify-around">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'home' ? 'text-orange-500' : 'text-slate-300'}`}>
            <Home size={24} fill={activeTab === 'home' ? 'currentColor' : 'none'} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.home[lang]}</span>
          </button>
          <button onClick={() => setActiveTab('explore')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'explore' ? 'text-orange-500' : 'text-slate-300'}`}>
            <Compass size={24} fill={activeTab === 'explore' ? 'currentColor' : 'none'} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.explore[lang]}</span>
          </button>
          <button onClick={() => setActiveTab('favorites')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'favorites' ? 'text-orange-500' : 'text-slate-300'}`}>
            <Heart size={24} fill={activeTab === 'favorites' ? 'currentColor' : 'none'} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.favorites[lang]}</span>
          </button>
        </div>
      </nav>

      {selectedPlace && <DetailsView place={selectedPlace} lang={lang} onClose={() => setSelectedPlace(null)} />}
      {isBioOpen && cityBio && <CityBio lang={lang} data={cityBio} onClose={() => setIsBioOpen(false)} onOpenArticle={() => setIsArticleOpen(true)} />}
      {isArticleOpen && cityBio && <CityArticle lang={lang} data={cityBio} onClose={() => setIsArticleOpen(false)} />}
    </div>
  );
};

export default App;
