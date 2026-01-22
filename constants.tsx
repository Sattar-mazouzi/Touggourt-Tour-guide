
import { Place } from './types';

export const PLACES: Place[] = [
  {
    id: '1',
    name: { 
      en: 'Great Mosque of Touggourt', 
      ar: 'المسجد الكبير بتقرت', 
      fr: 'Grande Mosquée de Touggourt' 
    },
    description: { 
      en: 'A historic mosque dating back to the 18th century, representing the unique architecture of the Oued Righ region.',
      ar: 'مسجد تاريخي يعود إلى القرن الثامن عشر، يمثل الهندسة المعمارية الفريدة لمنطقة وادي ريغ.',
      fr: 'Une mosquée historique datant du XVIIIe siècle, représentant l\'architecture unique de la région de l\'Oued Righ.'
    },
    category: 'religion',
    rating: 4.8,
    imageUrl: { 
      cover: 'https://picsum.photos/seed/toug_mosque/800/600',
      img1: 'https://picsum.photos/seed/toug_mosque_alt1/800/600',
      img2: 'https://picsum.photos/seed/toug_mosque_alt2/800/600'
    },
    location: {
      lat: 33.1064,
      lng: 6.0628
    },
    address: { 
      en: 'Center of Touggourt, Algeria', 
      ar: 'وسط مدينة تقرت، الجزائر', 
      fr: 'Centre de Touggourt, Algérie' 
    },
    featured: true
  },
  {
    id: '2',
    name: { 
      en: 'The Palmeraie of Touggourt', 
      ar: 'واحات النخيل بتقرت', 
      fr: 'La Palmeraie de Touggourt' 
    },
    description: {
      en: 'Stunning expanse of date palms, providing a cool oasis and producing some of the finest Deglet Nour dates.',
      ar: 'مساحات شاسعة مذهلة من نخيل التمر، توفر واحة باردة وتنتج أجود أنواع تمر دقلة نور.',
      fr: 'Une vaste étendue de palmiers-dattiers, offrant une oasis de fraîcheur et produisant les meilleures dattes Deglet Nour.'
    },
    category: 'natural',
    rating: 4.7,
    imageUrl: { 
      cover: 'https://picsum.photos/seed/toug_palms/800/600',
      img1: 'https://picsum.photos/seed/toug_palms_alt1/800/600'
    },
    location: {
      lat: 33.1150,
      lng: 6.0750
    },
    address: { 
      en: 'Oasis Region, Touggourt', 
      ar: 'منطقة الواحات، تقرت', 
      fr: 'Région des Oasis, Touggourt' 
    },
    featured: true
  }
];
