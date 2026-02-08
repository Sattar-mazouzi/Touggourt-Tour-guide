
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Map as MapIcon, Heart, Home, Compass, List, Sparkles, Landmark, Loader2, Bed, Utensils, History, Leaf, User as UserIcon, Layers, Image as ImageIcon, SortDesc, SortAsc, Maximize, X, Info, Store, Building2, Coffee, Car, Fuel, HelpCircle, GraduationCap, PlusSquare } from 'lucide-react';
import { db, analytics } from './firebase';
import { logEvent } from 'firebase/analytics';
import { collection, getDocs, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { Place, GalleryItem, Language, Category, CityBioData, CategoryConfig, AboutAppData } from './types';
import { translations } from './i18n';
import PlaceCard from './components/PlaceCard';
import ServiceCard from './components/ServiceCard';
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

const SERVICE_SUBCATEGORIES = [
  'all', 'hotels', 'restaurants', 'coffee', 'mosques', 'banks', 'stores', 'pharmacies', 'hospitals', 'schools', 'parking', 'fuel'
];

const AppContent: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'gallery' | 'favorites' | 'about'>('home');
  const [exploreMode, setExploreMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);
  const [isBioOpen, setIsBioOpen] = useState(false);
  const [isArticleOpen, setIsArticleOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  const [gallerySortOrder, setGallerySortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [places, setPlaces] = useState<Place[]>([]);
  const [dynamicServices, setDynamicServices] = useState<Place[]>([]);
  const [isFetchingServices, setIsFetchingServices] = useState(false);
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
    if (key.includes('bank') || key.includes('finance')) return <Building2 size={20} />;
    if (key.includes('shop') || key.includes('store')) return <Store size={20} />;
    if (key.includes('services')) return <Layers size={20} />;
    if (key.includes('parking')) return <Car size={20} />;
    if (key.includes('fuel')) return <Fuel size={20} />;
    return <Sparkles size={20} />;
  };

  const getSubCategoryIcon = (sub: string) => {
    switch (sub) {
      case 'hotels': return <Bed size={14} />;
      case 'restaurants': return <Utensils size={14} />;
      case 'coffee': return <Coffee size={14} />;
      case 'mosques': return <Landmark size={14} />;
      case 'banks': return <Building2 size={14} />;
      case 'stores': return <Store size={14} />;
      case 'pharmacies': return <PlusSquare size={14} />;
      case 'hospitals': return <PlusSquare size={14} />;
      case 'schools': return <GraduationCap size={14} />;
      case 'parking': return <Car size={14} />;
      case 'fuel': return <Fuel size={14} />;
      default: return <Sparkles size={14} />;
    }
  };

  const getDynamicServiceImage = (tags: any) => {
    if (tags.amenity === 'restaurant' || tags.amenity === 'food_court' || tags.amenity === 'fast_food') return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop';
    if (tags.amenity === 'cafe') return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop';
    if (tags.amenity === 'bank' || tags.amenity === 'atm') return 'https://images.unsplash.com/photo-1541354451442-952fe76601f0?q=80&w=800&auto=format&fit=crop';
    if (tags.amenity === 'mosque' || tags.amenity === 'place_of_worship') return 'https://images.unsplash.com/photo-1590076212ef3-728b7e289895?q=80&w=800&auto=format&fit=crop';
    if (tags.tourism === 'hotel' || tags.tourism === 'hostel' || tags.tourism === 'guest_house') return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop';
    if (tags.shop) return 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?q=80&w=800&auto=format&fit=crop';
    if (tags.amenity === 'parking') return 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=800&auto=format&fit=crop';
    if (tags.amenity === 'fuel') return 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop';
    return 'https://images.unsplash.com/photo-1449156001931-82992a47279c?q=80&w=800&auto=format&fit=crop';
  };

  const fetchOSMServices = useCallback(async () => {
    if (places.length === 0 || dynamicServices.length > 0 || isFetchingServices) return;
    
    setIsFetchingServices(true);
    try {
      let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
      places.forEach(p => {
        if (p.location.lat < minLat) minLat = p.location.lat;
        if (p.location.lat > maxLat) maxLat = p.location.lat;
        if (p.location.lng < minLng) minLng = p.location.lng;
        if (p.location.lng > maxLng) maxLng = p.location.lng;
      });

      const buffer = 0.05; 
      const bbox = `${minLat - buffer},${minLng - buffer},${maxLat + buffer},${maxLng + buffer}`;

      const query = `[out:json][timeout:25];
        (
          node["amenity"~"restaurant|cafe|fast_food|bank|atm|pharmacy|hospital|post_office|marketplace|clinic|mosque|place_of_worship|parking|fuel|school|university"](${bbox});
          node["shop"](${bbox});
          node["tourism"~"hotel|museum|hostel|guest_house|information|attraction"](${bbox});
        );
        out body;`;

      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.elements) {
        const mapped: Place[] = data.elements.map((el: any) => {
          const amenity = el.tags.amenity;
          const shop = el.tags.shop;
          const tourism = el.tags.tourism;
          
          let sub: string = 'all';
          if (amenity === 'restaurant' || amenity === 'fast_food' || amenity === 'food_court') sub = 'restaurants';
          else if (amenity === 'cafe') sub = 'coffee';
          else if (amenity === 'bank' || amenity === 'atm') sub = 'banks';
          else if (amenity === 'mosque' || amenity === 'place_of_worship') sub = 'mosques';
          else if (tourism === 'hotel' || tourism === 'hostel' || tourism === 'guest_house') sub = 'hotels';
          else if (shop) sub = 'stores';
          else if (amenity === 'pharmacy') sub = 'pharmacies';
          else if (amenity === 'hospital' || amenity === 'clinic' || amenity === 'doctors') sub = 'hospitals';
          else if (amenity === 'school' || amenity === 'university' || amenity === 'college' || amenity === 'kindergarten') sub = 'schools';
          else if (amenity === 'parking') sub = 'parking';
          else if (amenity === 'fuel') sub = 'fuel';

          const nameStr = el.tags.name || (lang === 'ar' ? 'خدمة محلية' : (lang === 'fr' ? 'Service local' : 'Local Service'));
          
          return {
            id: `osm-${el.id}`,
            name: { en: nameStr, ar: nameStr, fr: nameStr },
            description: { 
              en: `Service point available in Touggourt area. Type: ${sub}`, 
              ar: `نقطة خدمة متوفرة في منطقة تقرت. النوع: ${t[sub]?.[lang] || sub}`, 
              fr: `Point de service disponible dans la zone de Touggourt. Type: ${sub}` 
            },
            category: 'services',
            subCategory: sub,
            rating: 4.0 + (Math.random() * 0.8),
            imageUrl: { cover: getDynamicServiceImage(el.tags) },
            location: { lat: el.lat, lng: el.lon },
            address: { 
              en: el.tags['addr:street'] || 'Touggourt, Algeria', 
              ar: el.tags['addr:street'] || 'تقرت، الجزائر', 
              fr: el.tags['addr:street'] || 'Touggourt, Algérie' 
            },
            featured: false
          };
        });
        
        const unique = mapped.reduce((acc: Place[], current) => {
          const x = acc.find(item => item.name.en === current.name.en && Math.abs(item.location.lat - current.location.lat) < 0.001);
          if (!x) return acc.concat([current]);
          return acc;
        }, []);

        setDynamicServices(unique);
      }
    } catch (error) {
      console.warn("OSM Services fetch failed", error);
    } finally {
      setIsFetchingServices(false);
    }
  }, [places, dynamicServices.length, isFetchingServices, lang, t]);

  useEffect(() => {
    if (selectedCategory === 'services' && places.length > 0) {
      fetchOSMServices();
    }
  }, [selectedCategory, places.length, fetchOSMServices]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
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
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
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
    
    const sourceData = selectedCategory === 'services' ? dynamicServices : places;
    
    return sourceData.filter(p => {
      if (selectedCategory === 'services') {
        if (!p.id.startsWith('osm-')) return false;
        if (selectedSubCategory !== 'all' && p.subCategory !== selectedSubCategory) return false;
      }
      
      const matchesSearch = (p.name[lang] || '').toLowerCase().includes(queryStr) || (p.description[lang] || '').toLowerCase().includes(queryStr);
      
      const matchesCategory = selectedCategory === 'all' || 
                              p.category.toLowerCase() === selectedCategory.toLowerCase();
      
      const isFav = activeTab === 'favorites' ? favorites.includes(p.id) : true;
      return matchesSearch && matchesCategory && isFav;
    });
  }, [searchQuery, selectedCategory, selectedSubCategory, activeTab, favorites, places, dynamicServices, lang]);

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

  if (isLoading) {
    return (
      <div className={`fixed inset-0 z-[9999] bg-slate-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700 ${lang === 'ar' ? 'font-arabic' : ''}`}>
        <div className="flex flex-col items-center gap-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-1000">
          <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-2xl shadow-orange-500/10 border border-slate-100 p-4">
            {appLogo ? (
              <img src={appLogo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full bg-orange-500 rounded-2xl flex items-center justify-center text-white font-black text-4xl">T</div>
            )}
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {t.appName[lang]}
            </h1>
            <div className="h-1 w-12 bg-orange-500 mx-auto rounded-full"></div>
          </div>

          <div className="flex flex-col items-center gap-4 mt-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest animate-pulse">
                {t.loadingCityInfo[lang]}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                      <button key={cat} onClick={() => { setSelectedCategory(cat); setActiveTab('explore'); setSelectedSubCategory('all'); }} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-all hover:bg-orange-50">
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
                  
                  {/* Category Pills */}
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-2">
                    {dynamicCategories.map(cat => (
                      <button key={cat} onClick={() => { setSelectedCategory(cat); setSelectedSubCategory('all'); }} className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${selectedCategory === cat ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-500 border-slate-200'}`}>
                        {cat === 'all' ? t.all[lang] : (categoryConfig[cat]?.[lang] || cat)}
                      </button>
                    ))}
                  </div>

                  {/* Service Subcategory Pills (Only visible when Services is selected) */}
                  {selectedCategory === 'services' && (
                    <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide animate-in slide-in-from-top-2 duration-300">
                      {SERVICE_SUBCATEGORIES.map(sub => (
                        <button 
                          key={sub} 
                          onClick={() => setSelectedSubCategory(sub)} 
                          className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedSubCategory === sub ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100'}`}
                        >
                          {sub !== 'all' && getSubCategoryIcon(sub)}
                          {sub === 'all' ? t.all[lang] : (t[sub]?.[lang] || sub)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <section className="mt-2">
                <div className="flex items-center justify-between mb-4">
                   <h2 className="text-xl font-bold text-slate-900">{activeTab === 'favorites' ? t.favorites[lang] : (searchQuery ? `"${searchQuery}"` : (categoryConfig[selectedCategory]?.[lang] || t.explore[lang]))}</h2>
                   {isFetchingServices && <Loader2 className="w-4 h-4 animate-spin text-orange-500" />}
                </div>
                <div className="space-y-4">
                  {filteredPlaces.length > 0 ? (
                    filteredPlaces.map(place => (
                      place.id.startsWith('osm-') ? (
                        <ServiceCard key={place.id} place={place} lang={lang} onSelect={setSelectedPlace} isFavorite={favorites.includes(place.id)} onToggleFavorite={handleToggleFavorite} />
                      ) : (
                        <PlaceCard key={place.id} place={place} lang={lang} onSelect={setSelectedPlace} isFavorite={favorites.includes(place.id)} onToggleFavorite={handleToggleFavorite} />
                      )
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
        </div>
      </main>

      <nav className="flex-shrink-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 pb-[calc(4px+env(safe-area-inset-bottom))] z-40">
        <div className="max-w-xl mx-auto flex justify-around p-2">
          <button onClick={() => { setActiveTab('home'); setSearchQuery(''); setSelectedCategory('all'); setSelectedSubCategory('all'); }} className={`flex flex-col items-center gap-1 transition-colors flex-1 py-1 ${activeTab === 'home' ? 'text-orange-500' : 'text-slate-400'}`}><Home size={22} /><span className="text-[8px] font-black uppercase tracking-[0.1em]">{t.home[lang]}</span></button>
          <button onClick={() => { setActiveTab('explore'); setSelectedCategory('all'); setSelectedSubCategory('all'); }} className={`flex flex-col items-center gap-1 transition-colors flex-1 py-1 ${activeTab === 'explore' ? 'text-orange-500' : 'text-slate-400'}`}><Compass size={22} /><span className="text-[8px] font-black uppercase tracking-[0.1em]">{t.explore[lang]}</span></button>
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
