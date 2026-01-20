
import { GoogleGenAI } from "@google/genai";

export const translateText = async (text: string, targetLang: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const langNames = {
    en: "English",
    ar: "Arabic",
    fr: "French"
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate the following text into ${langNames[targetLang as keyof typeof langNames]}. 
    The text is about Touggourt, a city in Algeria. Maintain a professional, inviting, and historical tone. 
    Return ONLY the translated text, nothing else.
    
    Text: "${text}"`,
  });

  return response.text?.trim() || text;
};

/**
 * Translates an entire object of strings (like CityBioData fields)
 */
export const translateCityData = async (sourceData: any, targetLang: string): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Identify which fields are localized objects or contain them
  const localizableKeys = [
    'bio', 'extendedBio', 'histBio', 'extendedHistBio', 
    'geography', 'climate', 'climateandTopography'
  ];

  const heritageKeys = [
    'industries', 'clothing', 'culinaryArts', 'folklore', 'festivals', 'games'
  ];

  const result = { ...sourceData };
  const langNames = { en: "English", ar: "Arabic", fr: "French" };

  // Prepare data for translation
  const dataToTranslate: any = {};
  
  // Flat keys
  localizableKeys.forEach(key => {
    if (sourceData[key]) {
      // Find source lang
      const sourceLang = Object.keys(sourceData[key]).find(l => sourceData[key][l]) || 'ar';
      dataToTranslate[key] = sourceData[key][sourceLang];
    }
  });

  // Heritage nested keys
  if (sourceData.heritage) {
    heritageKeys.forEach(hKey => {
      if (sourceData.heritage[hKey]) {
        const sourceLang = Object.keys(sourceData.heritage[hKey]).find(l => sourceData.heritage[hKey][l]) || 'ar';
        dataToTranslate[`heritage_${hKey}`] = sourceData.heritage[hKey][sourceLang];
      }
    });
  }

  const prompt = `You are a professional translator for a luxury tourism app. 
  Translate the following JSON object values from their source language into ${langNames[targetLang as keyof typeof langNames]}.
  The content is about the city of Touggourt in Algeria (Heritage, History, Geography).
  Maintain an elegant, informative, and proud tone.
  Keep the JSON keys exactly the same. Return ONLY the valid JSON.
  
  Input Data:
  ${JSON.stringify(dataToTranslate)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const translatedValues = JSON.parse(response.text || "{}");
    
    // Merge translated values back into the structure
    localizableKeys.forEach(key => {
      if (translatedValues[key]) {
        if (!result[key]) result[key] = {};
        result[key][targetLang] = translatedValues[key];
      }
    });

    // Handle Heritage back-merge
    if (sourceData.heritage) {
      if (!result.heritage) result.heritage = { ...sourceData.heritage };
      heritageKeys.forEach(hKey => {
        if (translatedValues[`heritage_${hKey}`]) {
          if (!result.heritage[hKey]) result.heritage[hKey] = {};
          result.heritage[hKey][targetLang] = translatedValues[`heritage_${hKey}`];
        }
      });
    }

    return result;
  } catch (error) {
    console.error("Translation failed:", error);
    return sourceData;
  }
};
