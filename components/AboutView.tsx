
import React from 'react';
import { Info, Mail, Facebook, Phone, Globe, ShieldCheck } from 'lucide-react';
import { Language, AboutAppData, Contributor } from '../types';
import { translations } from '../i18n';

interface Props {
  lang: Language;
  data: AboutAppData | null;
  appLogo: string | null;
}

const ContributorCard: React.FC<{ contributor: Contributor; lang: Language }> = ({ contributor, lang }) => {
  const t = translations;

  return (
    <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
          <ShieldCheck size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-black text-slate-900 leading-tight">
            {contributor.name[lang]}
          </h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {lang === 'ar' ? 'جهة مساهمة' : (lang === 'fr' ? 'Contributeur' : 'Contributor')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 pt-2">
        {contributor.email && (
          <a href={`mailto:${contributor.email}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl text-slate-600 hover:text-orange-600 transition-colors group">
            <Mail size={16} className="text-slate-400 group-hover:text-orange-500" />
            <span className="text-xs font-bold truncate">{contributor.email}</span>
          </a>
        )}
        {contributor.facebook && (
          <a href={contributor.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl text-slate-600 hover:text-orange-600 transition-colors group">
            <Facebook size={16} className="text-slate-400 group-hover:text-orange-500" />
            <span className="text-xs font-bold truncate">Facebook Page</span>
          </a>
        )}
        {(contributor.phone_1 || contributor.phone_2) && (
          <div className="flex flex-col gap-2">
            {contributor.phone_1 && (
              <a href={`tel:${contributor.phone_1}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl text-slate-600 hover:text-orange-600 transition-colors group">
                <Phone size={16} className="text-slate-400 group-hover:text-orange-500" />
                <span className="text-xs font-bold">{contributor.phone_1}</span>
              </a>
            )}
            {contributor.phone_2 && (
              <a href={`tel:${contributor.phone_2}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl text-slate-600 hover:text-orange-600 transition-colors group">
                <Phone size={16} className="text-slate-400 group-hover:text-orange-500" />
                <span className="text-xs font-bold">{contributor.phone_2}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const AboutView: React.FC<Props> = ({ lang, data, appLogo }) => {
  const t = translations;

  if (!data) return null;

  const contributorList = [
    data.contributors.contributor_1,
    data.contributors.contributor_2,
    data.contributors.contributor_3,
    data.contributors.contributor_4,
  ].filter(Boolean) as Contributor[];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* App Branding Hero */}
      <section className="text-center py-6">
        <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-slate-200 border border-slate-50 p-4">
          {appLogo ? (
            <img src={appLogo} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            <Info size={40} className="text-orange-500" />
          )}
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">{t.appName[lang]}</h2>
        <div className="flex items-center justify-center gap-2">
          <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">Version 1.0.0</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span className="px-3 py-1 bg-orange-50 rounded-full text-[10px] font-black text-orange-500 uppercase tracking-widest">Touggourt, Algeria</span>
        </div>
      </section>

      {/* Description */}
      <section className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Globe size={20} />
          </div>
          <h3 className="text-xl font-black text-slate-900">{t.overview[lang]}</h3>
        </div>
        <p className="text-slate-600 text-lg leading-relaxed font-medium whitespace-pre-wrap">
          {data.description[lang]}
        </p>
      </section>

      {/* Contributors */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
            <ShieldCheck size={20} />
          </div>
          <h3 className="text-xl font-black text-slate-900">{t.contributorsTitle[lang]}</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {contributorList.map((c, i) => (
            <ContributorCard key={i} contributor={c} lang={lang} />
          ))}
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="pt-8 border-t border-slate-100 text-center">
        <div className="w-12 h-1 bg-orange-500 mx-auto rounded-full mb-6"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
          {t.appName[lang]} &copy; {new Date().getFullYear()}
        </p>
        <p className="text-slate-300 font-medium text-[9px] mt-1">All rights reserved to the respective government agencies</p>
      </footer>
    </div>
  );
};

export default AboutView;
