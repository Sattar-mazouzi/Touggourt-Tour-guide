
import React from 'react';
import { Language } from '../types';

interface Props {
  current: Language;
  onChange: (lang: Language) => void;
}

const LanguageSwitcher: React.FC<Props> = ({ current, onChange }) => {
  return (
    <button
      onClick={() => onChange(current === 'en' ? 'ar' : 'en')}
      className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm text-sm font-medium border border-slate-200"
    >
      {current === 'en' ? 'العربية' : 'English'}
    </button>
  );
};

export default LanguageSwitcher;
