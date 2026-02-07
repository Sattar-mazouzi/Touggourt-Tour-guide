
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Map as MapIcon, Heart, Home, Compass, List, Sparkles, Landmark, Loader2, Bed, Utensils, History, Leaf, User as UserIcon, Layers, Image as ImageIcon, SortDesc, SortAsc, Maximize, X, Info } from 'lucide-react';
import { db, analytics } from './firebase';
import { logEvent } from 'firebase/analytics';
import { collection, getDocs, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { Place, GalleryItem, Language, Category, CityBioData, CategoryConfig, AboutAppData } from './types';
import { translations } from './i18n';
import PlaceCard from './components/PlaceCard';
import GalleryCard from './components/GalleryCard';
import DetailsView from './components/DetailsView';
import GalleryDetailsView from './components/GalleryDetailsView';
import LanguageSwitcher from './components/LanguageSwitcher';
import MapView from './components/MapView';
import CityBio from './components/CityBio';
import CityArticle from './components/CityArticle';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import ProfileView from './components/ProfileView';
import AboutView from './components/AboutView';
import { trackVisitorSession } from './services/visitor';

const ROUTE_TITLES: Record<string, { en: string; ar: string; fr: string }> = {
  all: {
    en: "Tourist route of Touggourt province",
    fr: "Route touristique de la province de Touggourt",
    ar: "المسار السياحي لولاية توقرت"
  },
  culture: {
    en: "The cultural tourism route of Touggourt province",
    fr: "La route du tourisme culturel de la province de Touggourt",
    ar: "المسار السياحي الثقافي لولاية توقرت"
  },
  nature: {
    en: "The tourist-natural route of Touggourt province",
    fr: "The tourist-natural route of Touggourt province",
    ar: "المسار السياحي الطبيعي لولاية توقرت"
  },
  religion: {
    en: "The religious-tourist route of Touggourt province",
    fr: "La route touristique religieuse de la province de Touggourt",
    ar: "المسار السياحي الديني لولاية توقرت"
  },
  services: {
    en: "Tourist route for the services of Touggourt province",
    fr: "La route touristique des services de la province de Touggourt",
    ar: "المسار السياحي للخدمات لولاية توقرت"
  }
};

const AppContent: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'gallery' | 'favorites' | 'about'>('home');
  const [exploreMode, setExploreMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);
  const [isBioOpen, setIsBioOpen] = useState(false);
  const [isArticleOpen, setIsArticleOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  const [gallerySortOrder, setGallerySortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [places, setPlaces] = useState<Place[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [cityBio, setCityBio] = useState<CityBioData | null>(null);
  const [cityBioDocIds, setCityBioDocIds] = useState<string[]>([]);
  const [categoryConfig, setCategoryConfig] = useState<CategoryConfig>({});
  const [aboutAppData, setAboutAppData] = useState<AboutAppData | null>(null);
  const [appLogo, setAppLogo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user, favorites, toggleFavorite, profile } = useAuth();
  const t = translations;

  useEffect(() => {
    trackVisitorSession();
  }, []);

  useEffect(() => {
    logEvent(analytics, 'screen_view', {
      firebase_screen: activeTab,
      firebase_screen_class: 'App'
    });
  }, [activeTab]);

  const getCategoryIcon = (catKey: string) => {
    const key = catKey.toLowerCase();
    if (key.includes('religion') || key.includes('religious')) return <Landmark size={20} />;
    if (key.includes('historical') || key.includes('history')) return <History size={20} />;
    if (key.includes('cultural') || key.includes('culture')) return <Compass size={20} />;
    if (key.includes('natural') || key.includes('nature')) return <Leaf size={20} />;
    if (key.includes('hotel')) return <Bed size={20} />;
    if (key.includes('restaurant')) return <Utensils size={20} />;
    return <Sparkles size={20} />;
  };

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch Config
      try {
        const catDocRef = doc(db, "appConfig", "categories");
        const catSnap = await getDoc(catDocRef);
        if (catSnap.exists()) {
          const data = catSnap.data() as CategoryConfig;
          if (Object.keys(data).length > 0) setCategoryConfig(data);
        }
        
        const logoDocRef = doc(db, "appConfig", "logo");
        const logoSnap = await getDoc(logoDocRef);
        if (logoSnap.exists()) {
          setAppLogo(logoSnap.data().mainLogo);
        }

        const aboutDocRef = doc(db, "appConfig", "aboutApp");
        const aboutSnap = await getDoc(aboutDocRef);
        if (aboutSnap.exists()) {
          setAboutAppData(aboutSnap.data() as AboutAppData);
        }
      } catch (err) { console.warn("Config fetch failed", err); }

      // Fetch Places
      try {
        const placesSnapshot = await getDocs(collection(db, "places"));
        const fetchedPlaces = placesSnapshot.docs.map(doc => {
          const data = doc.data();
          let imgObj: any = { cover: 'https://images.unsplash.com/photo-1544411047-c4915842273b?q=80&w=800&auto=format&fit=crop' };
          if (typeof data.imageUrl === 'string') imgObj.cover = data.imageUrl;
          else if (data.imageUrl && typeof data.imageUrl === 'object') imgObj = { ...data.imageUrl };
          return {
            id: doc.id,
            name: data.name || { en: 'Unnamed', ar: 'غير مسمى', fr: 'Sans nom' },
            description: data.description || { en: '', ar: '', fr: '' },
            category: (data.category || 'all').toLowerCase() as Category,
            rating: Number(data.rating) || 0,
            imageUrl: imgObj,
            address: data.address || { en: 'No address', ar: 'لا يوجد عنوان', fr: 'Aucune adresse' },
            location: { 
              lat: Number(data.location?.lat || data.location?.latitude || 33.1064), 
              lng: Number(data.location?.lng || data.location?.longitude || 6.0628) 
            },
            videoUrls: data.videoUrls || {},
            featured: !!data.featured,
            favoritesCount: Number(data.favoritesCount) || 0,
          };
        }) as Place[];
        setPlaces(fetchedPlaces);
      } catch (err) { console.error("Places fetch error", err); }

      // Fetch Gallery
      try {
        const gallerySnapshot = await getDocs(collection(db, "gallery"));
        const fetchedGallery = gallerySnapshot.docs.map(doc => {
          const data = doc.data();
          let createdAtValue = Date.now();
          if (data.createdAt) {
            if (typeof data.createdAt.toMillis === 'function') {
              createdAtValue = data.createdAt.toMillis();
            } else if (typeof data.createdAt === 'number') {
              createdAtValue = data.createdAt;
            } else {
              createdAtValue = new Date(data.createdAt).getTime() || Date.now();
            }
          }

          return {
            id: doc.id,
            title: data.title || { en: 'Visual', ar: 'مشهد', fr: 'Visuel' },
            description: data.description || { en: '', ar: '', fr: '' },
            createdAt: createdAtValue,
            images: data.images || {},
            videos: data.videos || {},
          };
        }) as GalleryItem[];
        setGalleryItems(fetchedGallery);
      } catch (err) { console.warn("Gallery fetch failed", err); }

      // Fetch City Bio
      try {
        const bioSnapshot = await getDocs(collection(db, "aboutCity"));
        let mergedBioData: any = {};
        const ids: string[] = [];
        bioSnapshot.forEach(doc => { 
          ids.push(doc.id);
          mergedBioData = { ...mergedBioData, ...doc.data() }; 
        });
        setCityBioDocIds(ids);
        if (Object.keys(mergedBioData).length > 0) setCityBio(mergedBioData as CityBioData);
      } catch (err) { console.warn("City Bio fetch failed.", err); }
      
    } catch (error) {
      console.error("Firestore loading error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleIncrementReadingCount = async () => {
    if (cityBioDocIds.length === 0) return;
    try {
      const docRef = doc(db, "aboutCity", cityBioDocIds[0]);
      await updateDoc(docRef, { readingCount: increment(1) });
      setCityBio(prev => prev ? { ...prev, readingCount: (prev.readingCount || 0) + 1 } : null);
    } catch (err) { console.error("Failed to increment reading count:", err); }
  };

  useEffect(() => {
    const bioSeen = sessionStorage.getItem('touggourt_bio_seen');
    if (!bioSeen) {
      setIsBioOpen(true);
      sessionStorage.setItem('touggourt_bio_seen', 'true');
    }
    fetchData();
  }, [fetchData]);

  const handleToggleFavorite = (id: string) => {
    if (!user) { setIsAuthModalOpen(true); return; }
    toggleFavorite(id);
  };

  const filteredPlaces = useMemo(() => {
    const queryStr = searchQuery.toLowerCase();
    return places.filter(p => {
      const matchesSearch = (p.name[lang] || '').toLowerCase().includes(queryStr) || (p.description[lang] || '').toLowerCase().includes(queryStr);
      const matchesCategory = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
      const isFav = activeTab === 'favorites' ? favorites.includes(p.id) : true;
      return matchesSearch && matchesCategory && isFav;
    });
  }, [searchQuery, selectedCategory, activeTab, favorites, places, lang]);

  const filteredGallery = useMemo(() => {
    if (activeTab !== 'gallery') return [];
    const queryStr = searchQuery.toLowerCase();
    const filtered = galleryItems.filter(item => 
      (item.title[lang] || '').toLowerCase().includes(queryStr) || 
      (item.description[lang] || '').toLowerCase().includes(queryStr)
    );

    return [...filtered].sort((a, b) => {
      if (gallerySortOrder === 'desc') {
        return b.createdAt - a.createdAt;
      }
      return a.createdAt - b.createdAt;
    });
  }, [galleryItems, searchQuery, activeTab, lang, gallerySortOrder]);

  const featuredPlaces = useMemo(() => places.filter(p => p.featured), [places]);
  const dynamicCategories = useMemo(() => ['all', ...Object.keys(categoryConfig)], [categoryConfig]);
  
  const welcomeMessage = useMemo(() => {
    if (cityBio?.name?.[lang]) return lang === 'ar' ? `مرحباً بكم في ${cityBio.name[lang]}` : (lang === 'fr' ? `Bienvenue à ${cityBio.name[lang]}` : `Welcome to ${cityBio.name[lang]}`);
    return t.welcome[lang];
  }, [cityBio, lang, t]);

  const userInitial = profile?.fullName ? profile.fullName[0].toUpperCase() : null;

  return (
    <div className={`h-[100dvh] flex flex-col overflow-hidden bg-slate-50 ${lang === 'ar' ? 'rtl font-arabic' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 pt-[calc(1rem+env(safe-area-inset-top))] px-[calc(1rem+env(safe-area-inset-right))] pl-[calc(1rem+env(safe-area-inset-left))] relative z-50">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            {appLogo ? (
              <img src={appLogo} alt="Logo" className="w-10 h-10 object-contain rounded-xl" />
            ) : (
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-xl">T</div>
            )}
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-tight">{t.appName[lang]}</h1>
              <p className="text-[10px] uppercase tracking-widest text-orange-600 font-bold">{lang === 'ar' ? 'الجزائر' : (lang === 'fr' ? 'Algérie' : 'Algeria')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
               <button onClick={() => setIsProfileOpen(true)} className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black shadow-lg shadow-slate-900/10 active:scale-95 transition-all">
                 {userInitial || <UserIcon size={18} />}
               </button>
            ) : (
               <button onClick={() => setIsAuthModalOpen(true)} className="p-2 bg-orange-50 text-orange-600 rounded-xl"><Sparkles size={20} /></button>
            )}
            <LanguageSwitcher current={lang} onChange={setLang} />
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
                  <button onClick={() => setIsBioOpen(true)} className="text-left w-full group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-orange-500 group-hover:rotate-12 transition-transform"><Sparkles size={18} /></span>
                      <h2 className="text-2xl font-black text-slate-900 group-hover:text-orange-600 transition-colors">{welcomeMessage}</h2>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">{t.discoverPrompt[lang]}</p>
                  </button>
                </div>
              )}

              {(activeTab !== 'about') && (
                <div className="relative mb-6 group z-10">
                  <Search className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={20} />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={activeTab === 'gallery' ? (lang === 'ar' ? 'ابحث في المعرض...' : 'Search gallery...') : t.searchPlaceholder[lang]} className={`w-full ${lang === 'ar' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'} py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20 shadow-sm font-medium`} />
                </div>
              )}

              {activeTab === 'home' && searchQuery === '' && (
                <>
                  {featuredPlaces.length > 0 && (
                    <section className="mb-8">
                      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><Compass size={24} className="text-orange-500" />{t.featured[lang]}</h2>
                      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                        {featuredPlaces.map(place => (
                          <div key={place.id} onClick={() => setSelectedPlace(place)} className="min-w-[280px] h-48 relative rounded-3xl overflow-hidden snap-center group shadow-md">
                            <img src={place.imageUrl.cover} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={place.name[lang]} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                            <div className={`absolute bottom-4 ${lang === 'ar' ? 'right-4 left-4' : 'left-4 right-4'}`}>
                              <p className="text-white font-bold text-lg leading-tight">{place.name[lang]}</p>
                              <p className="text-white/80 text-xs mt-1 flex items-center gap-1"><MapIcon size={12} /> {place.address?.[lang] || ''}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                  {Object.keys(categoryConfig).length > 0 && (
                    <section className="mb-8">
                      <h2 className="text-xl font-bold text-slate-900 mb-4">{t.categories[lang]}</h2>
                      <div className="grid grid-cols-3 gap-3">
                        {dynamicCategories.filter(c => c !== 'all').map(cat => (
                          <button key={cat} onClick={() => { setSelectedCategory(cat); setActiveTab('explore'); }} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-all hover:bg-orange-50">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">{getCategoryIcon(cat)}</div>
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide text-center">{categoryConfig[cat]?.[lang] || cat}</span>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}

              {activeTab === 'gallery' ? (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900">{t.gallery[lang]}</h2>
                    <button 
                      onClick={() => setGallerySortOrder(gallerySortOrder === 'desc' ? 'asc' : 'desc')}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 active:scale-95 transition-all shadow-sm"
                    >
                      {gallerySortOrder === 'desc' ? <SortDesc size={14} /> : <SortAsc size={14} />}
                      {gallerySortOrder === 'desc' ? t.sortNewest[lang] : t.sortOldest[lang]}
                    </button>
                  </div>
                  {filteredGallery.length > 0 ? (
                    filteredGallery.map(item => (
                      <GalleryCard key={item.id} item={item} lang={lang} onClick={setSelectedGalleryItem} />
                    ))
                  ) : (
                    <div className="py-20 text-center text-slate-400">
                      <ImageIcon size={40} className="mx-auto mb-4 opacity-20" />
                      <p className="font-medium">{t.noPlacesFound[lang]}</p>
                    </div>
                  )}
                </section>
              ) : activeTab === 'about' ? (
                <AboutView lang={lang} data={aboutAppData} appLogo={appLogo} />
              ) : (
                <>
                  {(activeTab === 'explore' || searchQuery !== '') && (
                    <div className="sticky top-0 bg-slate-50/95 backdrop-blur-sm z-20 -mx-4 px-4 pb-4">
                      {activeTab === 'explore' && (
                        <div className="flex justify-center mb-4">
                          <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 w-full max-w-[240px]">
                            <button onClick={() => setExploreMode('list')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${exploreMode === 'list' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500'}`}><List size={16} />{t.list[lang]}</button>
                            <button onClick={() => setIsMapFullScreen(true)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all text-slate-500 hover:text-orange-600`}><MapIcon size={16} />{t.map[lang]}</button>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {dynamicCategories.map(cat => (
                          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${selectedCategory === cat ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-500 border-slate-200'}`}>
                            {cat === 'all' ? t.all[lang] : (categoryConfig[cat]?.[lang] || cat)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <section className="mt-2">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">{activeTab === 'favorites' ? t.favorites[lang] : (searchQuery ? `"${searchQuery}"` : t.explore[lang])}</h2>
                    <div className="space-y-4">
                      {filteredPlaces.length > 0 ? (
                        filteredPlaces.map(place => (
                          <PlaceCard key={place.id} place={place} lang={lang} onSelect={setSelectedPlace} isFavorite={favorites.includes(place.id)} onToggleFavorite={handleToggleFavorite} />
                        ))
                      ) : (
                        <div className="py-20 text-center text-slate-400">
                          <Compass size={40} className="mx-auto mb-4 opacity-20" />
                          <p className="font-medium">{activeTab === 'favorites' ? t.noFavorites[lang] : t.noPlacesFound[lang]}</p>
                        </div>
                      )}
                    </div>
                  </section>
                </>
              )}
            </>
          )}
        </div>
      </main>

      <nav className="flex-shrink-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 pb-[calc(4px+env(safe-area-inset-bottom))] z-40">
        <div className="max-w-xl mx-auto flex justify-around p-2">
          <button onClick={() => { setActiveTab('home'); setSearchQuery(''); setSelectedCategory('all'); }} className={`flex flex-col items-center gap-1 transition-colors flex-1 py-1 ${activeTab === 'home' ? 'text-orange-500' : 'text-slate-400'}`}><Home size={22} /><span className="text-[8px] font-black uppercase tracking-[0.1em]">{t.home[lang]}</span></button>
          <button onClick={() => { setActiveTab('explore'); setSelectedCategory('all'); }} className={`flex flex-col items-center gap-1 transition-colors flex-1 py-1 ${activeTab === 'explore' ? 'text-orange-500' : 'text-slate-400'}`}><Compass size={22} /><span className="text-[8px] font-black uppercase tracking-[0.1em]">{t.explore[lang]}</span></button>
          <button onClick={() => { setActiveTab('gallery'); setSearchQuery(''); }} className={`flex flex-col items-center gap-1 transition-colors flex-1 py-1 ${activeTab === 'gallery' ? 'text-orange-500' : 'text-slate-400'}`}><ImageIcon size={22} /><span className="text-[8px] font-black uppercase tracking-[0.1em]">{t.gallery[lang]}</span></button>
          <button onClick={() => { if(!user) setIsAuthModalOpen(true); else setActiveTab('favorites'); }} className={`flex flex-col items-center gap-1 transition-colors flex-1 py-1 ${activeTab === 'favorites' ? 'text-orange-500' : 'text-slate-400'}`}><Heart size={22} /><span className="text-[8px] font-black uppercase tracking-[0.1em]">{t.favorites[lang]}</span></button>
          <button onClick={() => { setActiveTab('about'); setSearchQuery(''); }} className={`flex flex-col items-center gap-1 transition-colors flex-1 py-1 ${activeTab === 'about' ? 'text-orange-500' : 'text-slate-400'}`}><Info size={22} /><span className="text-[8px] font-black uppercase tracking-[0.1em]">{t.about[lang]}</span></button>
        </div>
      </nav>

      {selectedPlace && <DetailsView place={selectedPlace} lang={lang} categoryConfig={categoryConfig} onClose={() => setSelectedPlace(null)} />}
      {selectedGalleryItem && <GalleryDetailsView item={selectedGalleryItem} lang={lang} onClose={() => setSelectedGalleryItem(null)} />}
      {isBioOpen && <CityBio lang={lang} onChangeLang={setLang} data={cityBio} allGalleryItems={galleryItems} onClose={() => setIsBioOpen(false)} onOpenArticle={() => { handleIncrementReadingCount(); setIsArticleOpen(true); }} />}
      {isArticleOpen && cityBio && <CityArticle lang={lang} data={cityBio} allGalleryItems={galleryItems} onClose={() => setIsArticleOpen(false)} />}
      {isAuthModalOpen && <AuthModal lang={lang} onClose={() => setIsAuthModalOpen(false)} />}
      {isProfileOpen && <ProfileView lang={lang} onClose={() => setIsProfileOpen(false)} />}

      {isMapFullScreen && (
        <div className="fixed inset-0 z-[2500] bg-white flex flex-col h-[100dvh] animate-in fade-in duration-300">
          <header className="flex-shrink-0 bg-white/90 backdrop-blur-md border-b border-slate-100 p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between z-10">
            <button onClick={() => setIsMapFullScreen(false)} className="p-2 -ml-2 text-slate-900 hover:bg-slate-50 rounded-full transition-colors flex items-center gap-1">
              <X size={24} />
              <span className="font-bold text-sm">{t.back[lang]}</span>
            </button>
            <h2 className="text-sm md:text-lg font-black text-slate-900 text-center flex-1 px-2 leading-tight">
              {ROUTE_TITLES[selectedCategory]?.[lang] || t.map[lang]}
            </h2>
            <div className="w-10"></div>
          </header>
          <div className="flex-1 relative">
             <MapView 
               places={filteredPlaces} 
               lang={lang} 
               onSelectPlace={(p) => { setSelectedPlace(p); setIsMapFullScreen(false); }} 
               height="h-full" 
               initialZoom={14}
               showPreviews={true}
               activeCategory={selectedCategory}
             />
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
