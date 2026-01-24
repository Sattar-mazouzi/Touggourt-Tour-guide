
export type Category = string;

export interface Place {
  id: string;
  name: { en: string; ar: string; fr: string };
  description: { en: string; ar: string; fr: string };
  category: Category;
  rating: number;
  imageUrl: {
    cover: string;
    img1?: string;
    img2?: string;
    img3?: string;
    img4?: string;
    img5?: string;
  };
  location: {
    lat: number;
    lng: number;
  };
  address: { en: string; ar: string; fr: string };
  featured?: boolean;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  role: 'visitor' | 'admin' | 'content manager';
  age?: number;
  createdAt: number;
}

export interface Review {
  id?: string;
  userId: string;
  userName: string;
  placeId: string;
  rating: number;
  comment: string;
  timestamp: number;
}

export interface HeritageData {
  industries: { en: string; ar: string; fr: string };
  clothing: { en: string; ar: string; fr: string };
  culinaryArts: { en: string; ar: string; fr: string };
  folklore: { en: string; ar: string; fr: string };
  festivals: { en: string; ar: string; fr: string };
  games: { en: string; ar: string; fr: string };
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
  heritage?: HeritageData;
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

export interface CategoryConfig {
  [key: string]: {
    en: string;
    ar: string;
    fr: string;
  };
}
