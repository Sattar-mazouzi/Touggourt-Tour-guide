
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const askAiGuide = async (prompt: string, language: 'en' | 'ar' | 'fr') => {
  try {
    const langMap = { en: 'English', ar: 'Arabic', fr: 'French' };
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: `You are an expert tour guide for the city of Touggourt, Algeria. 
        Provide helpful, historically accurate, and engaging information in ${langMap[language]}.
        Keep responses concise and suitable for a mobile app screen.`
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Guide Error:", error);
    const errorMsgs = {
      en: "I'm sorry, I couldn't connect right now. Please try again.",
      ar: "عذراً، لم أتمكن من الاتصال حالياً. يرجى المحاولة لاحقاً.",
      fr: "Désolé, je ne peux pas me connecter pour le moment. Veuillez réessayer."
    };
    return errorMsgs[language];
  }
};
