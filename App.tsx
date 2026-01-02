
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Map as MapIcon, Heart, Home, Compass, Menu } from 'lucide-react';
import { PLACES } from './constants';
import { Place, Language, Category } from './types';
import { translations } from './i18n';
import PlaceCard from './components/PlaceCard';
import DetailsView from './components/DetailsView';
import LanguageSwitcher from './components/LanguageSwitcher';
import AiGuide from './components/AiGuide';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'favorites'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('touggourt_favs');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('touggourt_favs', JSON.stringify(updated));
      return updated;
    });
  };

  const filteredPlaces = useMemo(() => {
    return PLACES.filter(p => {
      const matchesSearch = p.name[lang].toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description[lang].toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const isFav = activeTab === 'favorites' ? favorites.includes(p.id) : true;
      return matchesSearch && matchesCategory && isFav;
    });
  }, [searchQuery, selectedCategory, lang, activeTab, favorites]);

  const featuredPlaces = useMemo(() => PLACES.filter(p => p.featured), []);

  const categories: Category[] = ['all', 'historical', 'cultural', 'natural', 'hotels', 'restaurants'];

  return (
    <div className={`min-h-screen pb-24 ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-xl">T</div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-tight">Touggourt</h1>
              <p className="text-[10px] uppercase tracking-widest text-orange-600 font-bold">{lang === 'en' ? 'Algeria' : 'الجزائر'}</p>
            </div>
          </div>
          <LanguageSwitcher current={lang} onChange={setLang} />
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4">
        {/* Search Bar */}
        <div className="relative mb-6 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={translations.searchPlaceholder[lang]}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
          />
        </div>

        {activeTab === 'home' && searchQuery === '' && (
          <>
            {/* Featured Section */}
            <section className="mb-8 overflow-hidden">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Compass size={24} className="text-orange-500" />
                {translations.featured[lang]}
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {featuredPlaces.map(place => (
                  <div 
                    key={place.id}
                    onClick={() => setSelectedPlace(place)}
                    className="min-w-[280px] h-48 relative rounded-3xl overflow-hidden snap-center group shadow-md"
                  >
                    <img src={place.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={place.name[lang]} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white font-bold text-lg leading-tight">{place.name[lang]}</p>
                      <p className="text-white/80 text-xs mt-1 flex items-center gap-1">
                        <MapIcon size={12} /> {place.location.address[lang]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Categories */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">{translations.categories[lang]}</h2>
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
                      {cat === 'historical' && <MapIcon size={20} />}
                      {cat === 'cultural' && <Compass size={20} />}
                      {cat === 'natural' && <Compass size={20} />}
                      {cat === 'hotels' && <Home size={20} />}
                      {cat === 'restaurants' && <Menu size={20} />}
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">{translations[cat][lang]}</span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Categories Pills (Always on Explore/Favorites or when searching) */}
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
                {translations[cat][lang]}
              </button>
            ))}
          </div>
        )}

        {/* Places List */}
        <section>
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold text-slate-900">
              {activeTab === 'favorites' ? translations.favorites[lang] : (searchQuery ? `"${searchQuery}"` : translations.explore[lang])}
            </h2>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
              {filteredPlaces.length}
            </span>
          </div>

          {filteredPlaces.length > 0 ? (
            <div className="space-y-4">
              {filteredPlaces.map(place => (
                <PlaceCard 
                  key={place.id} 
                  place={place} 
                  lang={lang} 
                  onSelect={setSelectedPlace}
                  isFavorite={favorites.includes(place.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Compass size={40} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">
                {activeTab === 'favorites' ? translations.noFavorites[lang] : (lang === 'en' ? 'No places found' : 'لم يتم العثور على أماكن')}
              </p>
            </div>
          )}
        </section>
      </main>

      {/* AI Guide */}
      <AiGuide lang={lang} />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-100 pb-safe z-40">
        <div className="max-w-xl mx-auto flex justify-around p-3">
          <button 
            onClick={() => { setActiveTab('home'); setSearchQuery(''); setSelectedCategory('all'); }}
            className={`flex flex-col items-center gap-1 group transition-colors ${activeTab === 'home' ? 'text-orange-500' : 'text-slate-400'}`}
          >
            <div className={`p-1.5 rounded-xl transition-colors ${activeTab === 'home' ? 'bg-orange-50' : 'group-hover:bg-slate-50'}`}>
              <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{translations.home[lang]}</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('explore'); setSelectedCategory('all'); }}
            className={`flex flex-col items-center gap-1 group transition-colors ${activeTab === 'explore' ? 'text-orange-500' : 'text-slate-400'}`}
          >
            <div className={`p-1.5 rounded-xl transition-colors ${activeTab === 'explore' ? 'bg-orange-50' : 'group-hover:bg-slate-50'}`}>
              <Compass size={24} strokeWidth={activeTab === 'explore' ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{translations.explore[lang]}</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('favorites')}
            className={`flex flex-col items-center gap-1 group transition-colors ${activeTab === 'favorites' ? 'text-orange-500' : 'text-slate-400'}`}
          >
            <div className={`p-1.5 rounded-xl transition-colors ${activeTab === 'favorites' ? 'bg-orange-50' : 'group-hover:bg-slate-50'}`}>
              <Heart size={24} strokeWidth={activeTab === 'favorites' ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{translations.favorites[lang]}</span>
          </button>
        </div>
      </nav>

      {/* Details View */}
      {selectedPlace && (
        <DetailsView 
          place={selectedPlace} 
          lang={lang} 
          onClose={() => setSelectedPlace(null)} 
        />
      )}
    </div>
  );
};

export default App;
