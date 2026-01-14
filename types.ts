
export type Category = 'historical' | 'religion' | 'cultural' | 'natural' | 'hotels' | 'restaurants' | 'all';

export interface Place {
  id: string;
  name: { en: string; ar: string; fr: string };
  description: { en: string; ar: string; fr: string };
  category: Category;
  rating: number;
  imageUrl: string;
  location: {
    lat: number;
    lng: number;
    address: { en: string; ar: string; fr: string };
  };
  featured?: boolean;
}

export type Language = 'en' | 'ar' | 'fr';

export interface TranslationDict {
  [key: string]: {
    en: string;
    ar: string;
    fr: string;
  };
}