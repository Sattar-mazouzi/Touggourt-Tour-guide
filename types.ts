
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
  };
  address: { en: string; ar: string; fr: string };
  featured?: boolean;
}

export interface CityBioData {
  name?: { en: string; ar: string; fr: string };
  bio: { en: string; ar: string; fr: string };
  extendedBio: { en: string; ar: string; fr: string };
  histBio: { en: string; ar: string; fr: string };
  extendedHistBio: { en: string; ar: string; fr: string };
  geography: { en: string; ar: string; fr: string };
  climate: { en: string; ar: string; fr: string };
  climateandTopography?: { en: string; ar: string; fr: string };
  population: string | number;
  location: string;
  cover: string;
  gallery: {
    architecture: string;
    camel: string;
    dunes: string;
    oasis: string;
    culture: string;
  };
}

export type Language = 'en' | 'ar' | 'fr';

export interface TranslationDict {
  [key: string]: {
    en: string;
    ar: string;
    fr: string;
  };
}