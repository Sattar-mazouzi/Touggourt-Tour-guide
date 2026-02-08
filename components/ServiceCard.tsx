
import React from 'react';
import { Place, Language } from '../types';
import { 
  Star, MapPin, Landmark, Coffee, Bed, Store, 
  PlusSquare, Building2, GraduationCap, Car, Fuel, 
  Utensils, HelpCircle
} from 'lucide-react';

interface Props {
  place: Place;
  lang: Language;
  onSelect: (place: Place) => void;
}

const ServiceCard: React.FC<Props> = ({ place, lang, onSelect }) => {
  // Logic to determine icon and color based on service type
  const getServiceVisuals = () => {
    const sub = place.subCategory;
    
    switch (sub) {
      case 'mosques':
        return { icon: <Landmark size={32} />, color: 'bg-emerald-500', bg: 'bg-emerald-50' };
      case 'coffee':
        return { icon: <Coffee size={32} />, color: 'bg-orange-500', bg: 'bg-orange-50' };
      case 'hotels':
        return { icon: <Bed size={32} />, color: 'bg-indigo-500', bg: 'bg-indigo-50' };
      case 'restaurants':
        return { icon: <Utensils size={32} />, color: 'bg-rose-500', bg: 'bg-rose-50' };
      case 'banks':
        return { icon: <Building2 size={32} />, color: 'bg-blue-600', bg: 'bg-blue-50' };
      case 'pharmacies':
      case 'hospitals':
        return { icon: <PlusSquare size={32} />, color: 'bg-red-500', bg: 'bg-red-50' };
      case 'schools':
        return { icon: <GraduationCap size={32} />, color: 'bg-violet-600', bg: 'bg-violet-50' };
      case 'stores':
        return { icon: <Store size={32} />, color: 'bg-amber-500', bg: 'bg-amber-50' };
      case 'parking':
        return { icon: <Car size={32} />, color: 'bg-slate-600', bg: 'bg-slate-50' };
      case 'fuel':
        return { icon: <Fuel size={32} />, color: 'bg-yellow-600', bg: 'bg-yellow-50' };
      default:
        return { icon: <HelpCircle size={32} />, color: 'bg-slate-400', bg: 'bg-slate-50' };
    }
  };

  const visuals = getServiceVisuals();

  return (
    <div 
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 mb-4 group active:scale-[0.98] transition-all flex items-center p-3 gap-4"
      onClick={() => onSelect(place)}
    >
      <div className={`w-20 h-20 rounded-2xl ${visuals.bg} flex items-center justify-center text-white flex-shrink-0 relative overflow-hidden`}>
        <div className={`absolute inset-0 opacity-10 ${visuals.color}`}></div>
        <div className={`${visuals.color} p-3 rounded-xl shadow-sm z-10 text-white`}>
          {visuals.icon}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-base font-black text-slate-900 mb-0.5 leading-tight truncate">
          {place.name[lang]}
        </h3>
        <div className="flex items-center gap-1 text-slate-400 text-[10px] mb-1.5 uppercase font-bold tracking-wider">
          <MapPin size={10} />
          <span className="truncate">{place.address?.[lang] || ''}</span>
        </div>
        <p className="text-slate-500 text-xs line-clamp-1 font-medium italic">
          {place.description[lang]}
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
          <Star size={10} className="text-yellow-500 fill-yellow-500" />
          <span className="text-[10px] font-black text-yellow-700">{place.rating.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
