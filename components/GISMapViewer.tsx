
import React, { useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { X, Maximize, RotateCcw, Loader2, Map as MapIcon, Layers } from 'lucide-react';
import { Language, GISMapConfig } from '../types';
import { translations } from '../i18n';

interface Props {
  lang: Language;
  onClose: () => void;
  config: GISMapConfig;
  activeCategory: string;
  categoryLabel?: string;
}

const GISMapViewer: React.FC<Props> = ({ lang, onClose, config, activeCategory, categoryLabel }) => {
  const t = translations;
  const [activeMap, setActiveMap] = useState<'main' | 'category'>(activeCategory !== 'all' && config[activeCategory] ? 'category' : 'main');
  const [isLoading, setIsLoading] = useState(true);

  // Fallback to mainMap if the category map doesn't exist
  const currentMapUrl = activeMap === 'category' ? (config[activeCategory] || config.mainMap) : config.mainMap;

  useEffect(() => {
    setIsLoading(true);
  }, [currentMapUrl]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-950 flex flex-col h-[100dvh] overflow-hidden animate-in fade-in duration-300">
      
      {/* Top Header Controls */}
      <div className="absolute top-0 left-0 w-full p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex justify-between items-center z-50 pointer-events-none">
        <button 
          onClick={onClose} 
          className="p-3 bg-white/10 backdrop-blur-xl text-white rounded-full border border-white/20 pointer-events-auto active:scale-90 transition-transform shadow-2xl"
        >
          <X size={24} />
        </button>

        <div className="bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.6)]"></div>
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">GIS High Resolution</span>
        </div>
      </div>

      {/* Main Map Content */}
      <div className="flex-1 relative w-full h-full flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-slate-950/80 backdrop-blur-sm">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest animate-pulse">
              {t.loading[lang]}
            </p>
          </div>
        )}

        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={6}
          centerOnInit={true}
          limitToBounds={false}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Utility Floating Controls */}
              <div className="absolute bottom-32 right-6 z-50 flex flex-col gap-3 pointer-events-none">
                <button 
                  onClick={() => resetTransform()} 
                  className="p-4 bg-white/10 backdrop-blur-xl text-white rounded-2xl border border-white/20 pointer-events-auto active:scale-90 transition-transform shadow-2xl flex items-center gap-2"
                >
                  <RotateCcw size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t.resetZoom[lang]}</span>
                </button>
              </div>

              <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                <img 
                  src={currentMapUrl} 
                  alt="GIS Map" 
                  className={`max-w-none transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                  onLoad={handleImageLoad}
                  style={{ width: 'auto', height: '85vh' }}
                />
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>

      {/* Bottom Switcher Control */}
      <div className="absolute bottom-0 left-0 w-full p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] z-50">
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-2xl p-1.5 rounded-[28px] border border-white/10 flex gap-1.5">
          <button 
            onClick={() => setActiveMap('main')}
            className={`flex-1 py-4 rounded-[22px] flex items-center justify-center gap-2 transition-all ${activeMap === 'main' ? 'bg-white text-slate-900 shadow-xl' : 'text-white/60 hover:text-white'}`}
          >
            <MapIcon size={18} />
            <span className="text-xs font-black uppercase tracking-widest">{t.gisMainMap[lang]}</span>
          </button>
          
          {activeCategory !== 'all' && config[activeCategory] && (
            <button 
              onClick={() => setActiveMap('category')}
              className={`flex-1 py-4 rounded-[22px] flex items-center justify-center gap-2 transition-all ${activeMap === 'category' ? 'bg-orange-500 text-white shadow-xl' : 'text-white/60 hover:text-white'}`}
            >
              <Layers size={18} />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] font-black uppercase tracking-widest">{t.gisCategoryMap[lang]}</span>
                <span className="text-[8px] font-bold opacity-80 mt-0.5">{categoryLabel}</span>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GISMapViewer;
