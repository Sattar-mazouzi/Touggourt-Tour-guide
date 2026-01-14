
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
    category: 'historical',
    rating: 4.8,
    imageUrl: 'https://picsum.photos/seed/toug_mosque/800/600',
    location: {
      lat: 33.1064,
      lng: 6.0628,
      address: { 
        en: 'Center of Touggourt, Algeria', 
        ar: 'وسط مدينة تقرت، الجزائر', 
        fr: 'Centre de Touggourt, Algérie' 
      }
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
    imageUrl: 'https://picsum.photos/seed/toug_palms/800/600',
    location: {
      lat: 33.1150,
      lng: 6.0750,
      address: { 
        en: 'Oasis Region, Touggourt', 
        ar: 'منطقة الواحات، تقرت', 
        fr: 'Région des Oasis, Touggourt' 
      }
    },
    featured: true
  },
  {
    id: '3',
    name: { 
      en: 'Zaouia of Tidjania', 
      ar: 'الزاوية التجانية', 
      fr: 'Zaouïa de Tidjania' 
    },
    description: {
      en: 'A spiritual and cultural center for the Tidjania brotherhood, attracting visitors from across Africa.',
      ar: 'مركز روحي وثقافي للطريقة التجانية، يستقطب الزوار من كافة أنحاء أفريقيا.',
      fr: 'Un centre spirituel et culturel pour la confrérie Tidjania, attirant des visiteurs de toute l\'Afrique.'
    },
    category: 'cultural',
    rating: 4.9,
    imageUrl: 'https://picsum.photos/seed/toug_tidjania/800/600',
    location: {
      lat: 33.1000,
      lng: 6.0600,
      address: { 
        en: 'Tamacine, Near Touggourt', 
        ar: 'تماسين، بالقرب من تقرت', 
        fr: 'Tamacine, près de Touggourt' 
      }
    }
  },
  {
    id: '4',
    name: { 
      en: 'Hotel Oasis', 
      ar: 'فندق الواحات', 
      fr: 'Hôtel Oasis' 
    },
    description: {
      en: 'Modern hotel offering traditional Saharan hospitality and comfortable amenities for travelers.',
      ar: 'فندق عصري يقدم كرم الضيافة الصحراوية التقليدية ووسائل الراحة المريحة للمسافرين.',
      fr: 'Hôtel moderne offrant l\'hospitalité saharienne traditionnelle et des équipements confortables.'
    },
    category: 'hotels',
    rating: 4.2,
    imageUrl: 'https://picsum.photos/seed/toug_hotel/800/600',
    location: {
      lat: 33.1080,
      lng: 6.0650,
      address: { 
        en: 'Main Road, Touggourt', 
        ar: 'الطريق الرئيسي، تقرت', 
        fr: 'Route Principale, Touggourt' 
      }
    }
  },
  {
    id: '5',
    name: { 
      en: 'Restaurant Le Sahara', 
      ar: 'مطعم الصحراء', 
      fr: 'Restaurant Le Sahara' 
    },
    description: {
      en: 'Specializing in local dishes like Chakhchoukha and traditional Couscous.',
      ar: 'متخصص في الأطباق المحلية مثل الشخشوخة والكسكسي التقليدي.',
      fr: 'Spécialisé dans les plats locaux comme la Chakhchoukha et le Couscous traditionnel.'
    },
    category: 'restaurants',
    rating: 4.5,
    imageUrl: 'https://picsum.photos/seed/toug_food/800/600',
    location: {
      lat: 33.1070,
      lng: 6.0640,
      address: { 
        en: 'Commercial District, Touggourt', 
        ar: 'الحي التجاري، تقرت', 
        fr: 'Quartier Commercial, Touggourt' 
      }
    }
  }
];
