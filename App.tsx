
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

  useEffect(() => {
    logEvent(analytics, 'screen_view', {
      firebase_screen: activeTab,
      firebase_screen_class: 'App'
    });
  }, [activeTab]);

  useEffect(() => {
    if (selectedCategory !== 'all') {
      logEvent(analytics, 'select_content', {
        content_type: 'category',
        item_id: selectedCategory
      });
    }
  }, [selectedCategory]);

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
        
        // Normalize Category (e.g., 'nature' -> 'natural')
        let normalizedCategory = (data.category || 'all').toLowerCase();
        if (normalizedCategory === 'nature') normalizedCategory = 'natural';
        if (normalizedCategory === 'religious') normalizedCategory = 'religion';
        if (normalizedCategory === 'history') normalizedCategory = 'historical';
        if (normalizedCategory === 'culture') normalizedCategory = 'cultural';
        if (normalizedCategory === 'hotel') normalizedCategory = 'hotels';
        if (normalizedCategory === 'restaurant') normalizedCategory = 'restaurants';

        // Handle migration from legacy string imageUrl to new map/object structure
        let imgObj: any = { cover: 'https://images.unsplash.com/photo-1544411047-c4915842273b?q=80&w=800&auto=format&fit=crop' };
        
        if (typeof data.imageUrl === 'string') {
          imgObj.cover = data.imageUrl;
        } else if (data.imageUrl && typeof data.imageUrl === 'object') {
          imgObj = { ...data.imageUrl };
        }

        // Support both 'lat'/'lng' and 'latitude'/'longitude' field names
        const lat = data.location?.latitude ?? data.location?.lat ?? 33.1064;
        const lng = data.location?.longitude ?? data.location?.lng ?? 6.0628;

        return {
          id: doc.id,
          name: data.name || { en: 'Unnamed', ar: 'غير مسمى', fr: 'Sans nom' },
          description: data.description || { en: '', ar: '', fr: '' },
          category: normalizedCategory as Category,
          rating: Number(data.rating) || 0,
          imageUrl: imgObj,
          featured: !!data.featured,
          location: { lat: Number(lat), lng: Number(lng) },
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
        const fieldsToNormalize = [
          'geography', 'climate', 'climateandTopography', 
          'bio', 'extendedBio', 'histBio', 'extendedHistBio'
        ];

        fieldsToNormalize.forEach(key => {
          if (mergedBioData[key] && typeof mergedBioData[key] === 'string') {
            mergedBioData[key] = { ar: mergedBioData[key], en: mergedBioData[key], fr: mergedBioData[key] };
          }
        });

        if (mergedBioData.heritage) {
          const hKeys = ['industries', 'clothing', 'culinaryArts', 'folklore', 'festivals', 'games'];
          hKeys.forEach(key => {
            if (mergedBioData.heritage[key] && typeof mergedBioData.heritage[key] === 'string') {
              mergedBioData.heritage[key] = { ar: mergedBioData.heritage[key], en: mergedBioData.heritage[key], fr: mergedBioData.heritage[key] };
            }
          });
        }
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
    const bioSeen = sessionStorage.getItem('touggourt_bio_seen');
    if (!bioSeen) {
      setIsBioOpen(true);
      sessionStorage.setItem('touggourt_bio_seen', 'true');
    }
    fetchData();
  }, [fetchData]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const isAdding = !prev.includes(id);
      const updated = isAdding ? [...prev, id] : prev.filter(f => f !== id);
      localStorage.setItem('touggourt_favs', JSON.stringify(updated));
      if (isAdding) {
        logEvent(analytics, 'add_to_wishlist', { item_id: id });
      }
      return updated;
    });
  };

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
    logEvent(analytics, 'view_item', {
      item_id: place.id,
      item_name: place.name.en,
      item_category: place.category
    });
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

  const welcomeMessage = useMemo(() => {
    if (cityBio?.name?.[lang]) {
      const cityName = cityBio.name[lang];
      if (lang === 'ar') return `مرحباً بكم في ${cityName}`;
      if (lang === 'fr') return `Bienvenue à ${cityName}`;
      return `Welcome to ${cityName}`;
    }
    return t.welcome[lang];
  }, [cityBio, lang, t]);

  return (
    <div 
      className={`h-[100dvh] flex flex-col overflow-hidden bg-slate-50 ${lang === 'ar' ? 'rtl font-arabic' : 'ltr'}`} 
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 pt-[calc(1rem+env(safe-area-inset-top))] relative z-50">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-xl">T</div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-tight">
                {t.appName[lang]}
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-orange-600 font-bold">
                {lang === 'ar' ? 'الجزائر' : (lang === 'fr' ? 'Algérie' : 'Algeria')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!hasApiKey && (window as any).aistudio && (
              <button 
                onClick={handleSelectKey}
                className="p-2 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 transition-colors"
                title="Select API Key"
              >
                <Key size={20} />
              </button>
            )}
            <LanguageSwitcher current={lang} onChange={(newLang) => {
              setLang(newLang);
              logEvent(analytics, 'change_language', { language: newLang });
            }} />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide px-4 pt-4">
        <div className="max-w-xl mx-auto pb-24">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <p className="font-bold text-xs uppercase tracking-widest">{t.loading[lang]}</p>
            </div>
          ) : (
            <>
              {activeTab === 'home' && searchQuery === '' && (
                <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
                  <button 
                    onClick={() => setIsBioOpen(true)}
                    className="text-left w-full group focus:outline-none"
                    dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-orange-500 group-hover:rotate-12 transition-transform"><Sparkles size={18} /></span>
                      <h2 className="text-2xl font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                        {welcomeMessage}
                      </h2>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">{t.discoverPrompt[lang]}</p>
                  </button>
                </div>
              )}

              <div className="relative mb-6 group z-10">
                <Search className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors`} size={20} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder[lang]}
                  className={`w-full ${lang === 'ar' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'} py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm font-medium`}
                />
              </div>

              {activeTab === 'home' && searchQuery === '' && (
                <>
                  {featuredPlaces.length > 0 && (
                    <section className="mb-8">
                      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Compass size={24} className="text-orange-500" />
                        {t.featured[lang]}
                      </h2>
                      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                        {featuredPlaces.map(place => (
                          <div 
                            key={place.id}
                            onClick={() => handlePlaceSelect(place)}
                            className="min-w-[280px] h-48 relative rounded-3xl overflow-hidden snap-center group shadow-md"
                          >
                            <img src={place.imageUrl.cover} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={place.name[lang]} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                            <div className={`absolute bottom-4 ${lang === 'ar' ? 'right-4 left-4' : 'left-4 right-4'}`}>
                              <p className="text-white font-bold text-lg leading-tight">{place.name[lang]}</p>
                              <p className="text-white/80 text-xs mt-1 flex items-center gap-1">
                                <MapIcon size={12} /> {place.address?.[lang] || ''}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <section className="mb-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">{t.categories[lang]}</h2>
                    <div className="grid grid-cols-3 gap-3">
                      {categories.filter(c => c !== 'all').map(cat => (
                        <button
                          key={cat}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setActiveTab('explore');
                          }}
                          className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-all hover:border-orange-200 hover:bg-orange-50"
                        >
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                            {cat === 'religion' && <Landmark size={20} />}
                            {cat === 'historical' && <MapIcon size={20} />}
                            {cat === 'cultural' && <Compass size={20} />}
                            {cat === 'natural' && <Compass size={20} />}
                            {cat === 'hotels' && <Home size={20} />}
                            {cat === 'restaurants' && <Menu size={20} />}
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide text-center">{t[cat][lang]}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {activeTab === 'explore' && (
                <div className="flex justify-center mb-6">
                  <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 w-full max-w-[200px]">
                    <button 
                      onClick={() => setExploreMode('list')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${exploreMode === 'list' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500'}`}
                    >
                      <List size={16} />
                      {t.list[lang]}
                    </button>
                    <button 
                      onClick={() => setExploreMode('map')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${exploreMode === 'map' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500'}`}
                    >
                      <MapIcon size={16} />
                      {t.map[lang]}
                    </button>
                  </div>
                </div>
              )}

              {(activeTab !== 'home' || searchQuery !== '') && (
                <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all ${
                        selectedCategory === cat 
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                          : 'bg-white text-slate-500 border border-slate-200'
                      }`}
                    >
                      {t[cat][lang]}
                    </button>
                  ))}
                </div>
              )}

              <section>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    {activeTab === 'favorites' ? t.favorites[lang] : (searchQuery ? `"${searchQuery}"` : t.explore[lang])}
                  </h2>
                </div>

                {activeTab === 'explore' && exploreMode === 'map' ? (
                  <MapView places={filteredPlaces} lang={lang} onSelectPlace={handlePlaceSelect} />
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
                      <div className="py-20 text-center text-slate-400">
                        <Compass size={40} className="mx-auto mb-2 opacity-20" />
                        <p>{t.noPlacesFound[lang]}</p>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      <nav className="flex-shrink-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 pb-[env(safe-area-inset-bottom)] z-40">
        <div className="max-w-xl mx-auto flex justify-around p-3">
          <button 
            onClick={() => { setActiveTab('home'); setSearchQuery(''); setSelectedCategory('all'); }}
            className={`flex flex-col items-center gap-1 group transition-colors ${activeTab === 'home' ? 'text-orange-500' : 'text-slate-400'}`}
          >
            <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{t.home[lang]}</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('explore'); setSelectedCategory('all'); }}
            className={`flex flex-col items-center gap-1 group transition-colors ${activeTab === 'explore' ? 'text-orange-500' : 'text-slate-400'}`}
          >
            <Compass size={24} strokeWidth={activeTab === 'explore' ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{t.explore[lang]}</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('favorites')}
            className={`flex flex-col items-center gap-1 group transition-colors ${activeTab === 'favorites' ? 'text-orange-500' : 'text-slate-400'}`}
          >
            <Heart size={24} strokeWidth={activeTab === 'favorites' ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{t.favorites[lang]}</span>
          </button>
        </div>
      </nav>

      {selectedPlace && <DetailsView place={selectedPlace} lang={lang} onClose={() => setSelectedPlace(null)} />}
      {isBioOpen && <CityBio lang={lang} data={cityBio} onClose={() => setIsBioOpen(false)} onOpenArticle={() => setIsArticleOpen(true)} />}
      {isArticleOpen && cityBio && <CityArticle lang={lang} data={cityBio} onClose={() => setIsArticleOpen(false)} />}
    </div>
  );
};

export default App;
