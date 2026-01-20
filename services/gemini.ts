
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Translation service using Google Gemini API.
 */

// Helper to get a fresh Gemini instance with the current API key
const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Translates a single piece of text using Gemini
 */
export const translateText = async (text: string, targetLang: string, sourceLang = "ar"): Promise<string> => {
  if (!text || text.trim() === "") return "";
  
  const ai = getGeminiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the following text from ${sourceLang} to ${targetLang}. 
      Provide only the translated text. Do not include any explanations or quotes.
      
      Text: ${text}`,
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini translation error:", error);
    return text;
  }
};

/**
 * Translates a group of keys in parallel using Gemini with a structured JSON output
 */
export const translateBatch = async (
  dataToTranslate: Record<string, string>, 
  targetLang: string
): Promise<Record<string, string>> => {
  const keys = Object.keys(dataToTranslate);
  if (keys.length === 0) return {};

  const ai = getGeminiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the values of the following JSON object to ${targetLang}. 
      Keep the same keys. Return only the valid JSON object.
      
      JSON: ${JSON.stringify(dataToTranslate)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: keys.reduce((acc, key) => {
            acc[key] = { type: Type.STRING };
            return acc;
          }, {} as any),
        },
      }
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    return result;
  } catch (error) {
    console.error("Gemini batch translation error:", error);
    // Fallback to individual translations if batch fails
    const results: Record<string, string> = {};
    const translations = await Promise.all(
      keys.map(key => translateText(dataToTranslate[key], targetLang))
    );
    keys.forEach((key, index) => {
      results[key] = translations[index];
    });
    return results;
  }
};

/**
 * Orchestrates city data translation in prioritized groups
 */
export const translateCityData = async (
  sourceData: any, 
  targetLang: string,
  onBatchComplete?: (updatedData: any) => void
): Promise<any> => {
  if (!sourceData) return null;
  
  const result = JSON.parse(JSON.stringify(sourceData));
  
  // Group 1: Core Content (Visible immediately in Bio)
  const coreKeys = ['bio', 'geography', 'climate'];
  const coreBatch: Record<string, string> = {};
  coreKeys.forEach(key => {
    if (sourceData[key]?.ar && !sourceData[key][targetLang]) {
      coreBatch[key] = sourceData[key].ar;
    }
  });

  if (Object.keys(coreBatch).length > 0) {
    try {
      const translated = await translateBatch(coreBatch, targetLang);
      Object.entries(translated).forEach(([key, value]) => {
        if (result[key]) result[key][targetLang] = value;
      });
      if (onBatchComplete) onBatchComplete(JSON.parse(JSON.stringify(result)));
    } catch (e) {
      console.error("Core batch translation failed");
    }
  }

  // Group 2: Detailed Articles (Extended info)
  const detailsKeys = ['extendedBio', 'histBio', 'climateandTopography'];
  const detailsBatch: Record<string, string> = {};
  detailsKeys.forEach(key => {
    if (sourceData[key]?.ar && !sourceData[key][targetLang]) {
      detailsBatch[key] = sourceData[key].ar;
    }
  });

  if (Object.keys(detailsBatch).length > 0) {
    try {
      const translated = await translateBatch(detailsBatch, targetLang);
      Object.entries(translated).forEach(([key, value]) => {
        if (result[key]) result[key][targetLang] = value;
      });
      if (onBatchComplete) onBatchComplete(JSON.parse(JSON.stringify(result)));
    } catch (e) {
      console.error("Details batch translation failed");
    }
  }

  // Group 3: Heritage section
  if (sourceData.heritage) {
    const hKeys = ['industries', 'clothing', 'culinaryArts', 'folklore', 'festivals', 'games'];
    const hBatch: Record<string, string> = {};
    hKeys.forEach(key => {
      if (sourceData.heritage[key]?.ar && !sourceData.heritage[key][targetLang]) {
        hBatch[key] = sourceData.heritage[key].ar;
      }
    });

    if (Object.keys(hBatch).length > 0) {
      try {
        const translated = await translateBatch(hBatch, targetLang);
        Object.entries(translated).forEach(([key, value]) => {
          if (!result.heritage[key]) result.heritage[key] = { ...sourceData.heritage[key] };
          result.heritage[key][targetLang] = value;
        });
        if (onBatchComplete) onBatchComplete(JSON.parse(JSON.stringify(result)));
      } catch (e) {
        console.error("Heritage batch translation failed");
      }
    }
  }

  return result;
};
