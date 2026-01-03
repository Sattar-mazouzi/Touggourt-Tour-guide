
import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI client with the required named parameter and environment key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const askAiGuide = async (prompt: string, language: 'en' | 'ar') => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: `You are an expert tour guide for the city of Touggourt, Algeria. 
        Provide helpful, historically accurate, and engaging information in ${language === 'en' ? 'English' : 'Arabic'}.
        Keep responses concise and suitable for a mobile app screen.`
      }
    });
    // Accessing .text as a property directly from GenerateContentResponse
    return response.text;
  } catch (error) {
    console.error("AI Guide Error:", error);
    return language === 'en' 
      ? "I'm sorry, I couldn't connect to my knowledge base right now. Please try again later."
      : "عذراً، لم أتمكن من الاتصال بقاعدة بياناتي حالياً. يرجى المحاولة لاحقاً.";
  }
};
