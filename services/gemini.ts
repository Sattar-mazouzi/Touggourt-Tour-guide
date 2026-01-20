
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Translation service using Google Gemini API
 */

/**
 * Translates a single piece of text using Gemini.
 * Uses gemini-3-flash-preview for basic text tasks.
 */
export const translateText = async (text: string, targetLang: string, sourceLang = "ar"): Promise<string> => {
  if (!text || text.trim() === "") return "";
  
  // Create a new instance right before the call to ensure it uses the most up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: text,
      config: {
        systemInstruction: `You are a professional desert explorer and translator. Translate the text from ${sourceLang} to ${targetLang}. Return ONLY the translated text, preserving formatting but without any extra commentary or quotes.`,
      },
    });

    return response.text || text;
  } catch (error) {
    console.error("Gemini translation error:", error);
    return text; // Fallback to original text
  }
};

/**
 * Translates a group of keys in parallel using Gemini's structured output capability.
 */
export const translateBatch = async (
  dataToTranslate: Record<string, string>, 
  targetLang: string
): Promise<Record<string, string>> => {
  const keys = Object.keys(dataToTranslate);
  if (keys.length === 0) return {};

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the values in this JSON object to ${targetLang}. Keep the keys exactly as they are. Return the result as a JSON object.\n\nJSON: ${JSON.stringify(dataToTranslate)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: keys.reduce((acc: any, key) => {
            acc[key] = { type: Type.STRING };
            return acc;
          }, {}),
          required: keys,
        }
      },
    });

    const translated = JSON.parse(response.text || '{}');
    return translated;
  } catch (error) {
    console.error("Gemini batch translation error:", error);
    // Fallback: Return original data if translation fails
    return dataToTranslate;
  }
};

/**
 * Orchestrates city data translation in prioritized groups.
 */
export const translateCityData = async (
  sourceData: any, 
  targetLang: string,
  onBatchComplete?: (updatedData: any) => void
): Promise<any> => {
  const result = JSON.parse(JSON.stringify(sourceData));
  
  // Group 1: Essential Info
  const coreKeys = ['bio', 'geography', 'climate'];
  const coreBatch: Record<string, string> = {};
  coreKeys.forEach(key => {
    if (sourceData[key]?.ar && !sourceData[key][targetLang]) {
      coreBatch[key] = sourceData[key].ar;
    }
  });

  if (Object.keys(coreBatch).length > 0) {
    const translated = await translateBatch(coreBatch, targetLang);
    Object.entries(translated).forEach(([key, value]) => {
      if (result[key]) result[key][targetLang] = value;
    });
    if (onBatchComplete) onBatchComplete(JSON.parse(JSON.stringify(result)));
  }

  // Group 2: Detailed Articles
  const detailsKeys = ['extendedBio', 'histBio', 'climateandTopography'];
  const detailsBatch: Record<string, string> = {};
  detailsKeys.forEach(key => {
    if (sourceData[key]?.ar && !sourceData[key][targetLang]) {
      detailsBatch[key] = sourceData[key].ar;
    }
  });

  if (Object.keys(detailsBatch).length > 0) {
    const translated = await translateBatch(detailsBatch, targetLang);
    Object.entries(translated).forEach(([key, value]) => {
      if (result[key]) result[key][targetLang] = value;
    });
    if (onBatchComplete) onBatchComplete(JSON.parse(JSON.stringify(result)));
  }

  // Group 3: Heritage
  if (sourceData.heritage) {
    const hKeys = ['industries', 'clothing', 'culinaryArts', 'folklore', 'festivals', 'games'];
    const hBatch: Record<string, string> = {};
    hKeys.forEach(key => {
      if (sourceData.heritage[key]?.ar && !sourceData.heritage[key][targetLang]) {
        hBatch[key] = sourceData.heritage[key].ar;
      }
    });

    if (Object.keys(hBatch).length > 0) {
      const translated = await translateBatch(hBatch, targetLang);
      Object.entries(translated).forEach(([key, value]) => {
        if (!result.heritage[key]) result.heritage[key] = { ...sourceData.heritage[key] };
        result.heritage[key][targetLang] = value;
      });
      if (onBatchComplete) onBatchComplete(JSON.parse(JSON.stringify(result)));
    }
  }

  return result;
};
