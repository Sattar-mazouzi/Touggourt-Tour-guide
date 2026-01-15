
import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { ChevronDown, Globe, Check } from 'lucide-react';

interface Props {
  current: Language;
  onChange: (lang: Language) => void;
}

const LanguageSwitcher: React.FC<Props> = ({ current, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string; full: string }[] = [
    { code: 'ar', label: 'AR', full: 'العربية' },
    { code: 'fr', label: 'FR', full: 'Français' },
    { code: 'en', label: 'EN', full: 'English' },
  ];

  const currentLang = languages.find((l) => l.code === current) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Backdrop to dim background and prevent interactions with content below while menu is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-[-1]" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 border rounded-2xl px-3 py-2 shadow-sm active:scale-95 transition-all group ${
          isOpen ? 'bg-white border-orange-500' : 'bg-white border-slate-200 hover:border-orange-200'
        }`}
      >
        <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 group-hover:rotate-12 transition-transform">
          <Globe size={14} />
        </div>
        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
          {currentLang.label}
        </span>
        <ChevronDown 
          size={14} 
          className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div 
          className={`absolute top-full mt-2 min-w-[160px] bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-900/10 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200 
            ${current === 'ar' ? 'left-0' : 'right-0'}`}
        >
          <div className="p-1">
            <div className={`px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] border-b border-slate-50 mb-1 ${current === 'ar' ? 'text-right' : 'text-left'}`}>
              {current === 'ar' ? 'اختر اللغة' : (current === 'fr' ? 'Choisir la langue' : 'Select Language')}
            </div>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onChange(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${
                  current === lang.code
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] w-6 font-black text-center ${current === lang.code ? 'text-orange-400' : 'text-slate-300'}`}>
                    {lang.label}
                  </span>
                  <span>{lang.full}</span>
                </div>
                {current === lang.code && <Check size={14} className="flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
