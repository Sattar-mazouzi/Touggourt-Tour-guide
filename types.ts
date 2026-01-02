
export type Category = 'historical' | 'cultural' | 'natural' | 'hotels' | 'restaurants' | 'all';

export interface Place {
  id: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  category: Category;
  rating: number;
  imageUrl: string;
  location: {
    lat: number;
    lng: number;
    address: { en: string; ar: string };
  };
  featured?: boolean;
}

export type Language = 'en' | 'ar';

export interface TranslationDict {
  [key: string]: {
    en: string;
    ar: string;
  };
}
