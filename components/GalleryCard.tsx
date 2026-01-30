
import React from 'react';
import { GalleryItem, Language } from '../types';
import { Image as ImageIcon, Video, Calendar } from 'lucide-react';

interface Props {
  item: GalleryItem;
  lang: Language;
  onClick: (item: GalleryItem) => void;
}

const GalleryCard: React.FC<Props> = ({ item, lang, onClick }) => {
  const displayImage = item.images.img1 || 'https://images.unsplash.com/photo-1544411047-c4915842273b?q=80&w=800&auto=format&fit=crop';
  const hasVideos = item.videos && (item.videos.video1 || item.videos.video2 || item.videos.video3);
  const imageCount = Object.values(item.images).filter(Boolean).length;

  const formattedDate = new Date(item.createdAt).toLocaleDateString(
    lang === 'ar' ? 'ar-DZ' : (lang === 'fr' ? 'fr-FR' : 'en-US'),
    { day: 'numeric', month: 'short', year: 'numeric' }
  );

  return (
    <div 
      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 mb-6 group active:scale-[0.98] transition-all"
      onClick={() => onClick(item)}
    >
      <div className="relative h-56 overflow-hidden">
        <img 
          src={displayImage} 
          alt={item.title[lang]} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        <div className="absolute top-4 left-4 flex gap-2">
           <div className="bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
             <ImageIcon size={14} className="text-orange-500" />
             <span className="text-[10px] font-black text-slate-800">{imageCount}</span>
           </div>
           {hasVideos && (
             <div className="bg-orange-600 text-white p-1.5 rounded-xl shadow-lg flex items-center justify-center">
               <Video size={14} />
             </div>
           )}
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-black text-white leading-tight drop-shadow-md">
            {item.title[lang]}
          </h3>
        </div>
      </div>
      <div className="p-5">
        <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed font-medium mb-3">
          {item.description?.[lang] || ''}
        </p>
        <div className="flex items-center gap-2 text-slate-400">
          <Calendar size={12} />
          <span className="text-[10px] font-bold uppercase tracking-wider">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;
