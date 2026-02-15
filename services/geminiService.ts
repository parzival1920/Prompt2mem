
import { GoogleGenAI, Type } from "@google/genai";
import { MemeStyle, GeminiMemeConfig } from "../types";

/**
 * Service layer acting as our secure backend logic.
 * The API_KEY is securely injected by the platform environment.
 */

export const generateMemeConfig = async (userPrompt: string, style: MemeStyle): Promise<GeminiMemeConfig> => {
  if (!process.env.API_KEY) {
    throw new Error("Missing API Configuration. Please verify environment settings.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a viral meme architect. Generate a meme concept for the following topic: "${userPrompt}". 
    The tone must be: ${style}.
    
    Instructions:
    1. Create a "Template Description": A vivid, cinematic visual scene WITHOUT any text in the image. Focus on expressions, irony, or dramatic lighting.
    2. Create a "Punchline": A short, impactful caption that perfectly complements the visual.
    
    Response MUST be valid JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          caption: {
            type: Type.STRING,
            description: "The witty meme text overlay.",
          },
          imagePrompt: {
            type: Type.STRING,
            description: "Vivid description for generating the meme template image.",
          },
        },
        required: ["caption", "imagePrompt"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("Received an empty response from the AI model.");
  
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("JSON Parse Error:", text);
    throw new Error("Failed to parse meme configuration. Please try again.");
  }
};

export const generateMemeImage = async (imagePrompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `A professional meme template, expressive, cinematic lighting, high-quality, NO TEXT in image: ${imagePrompt}`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    },
  });

  const candidate = response.candidates?.[0];
  if (!candidate) throw new Error("Visual engine failed to produce a candidate. The model might be overloaded.");

  for (const part of candidate.content.parts) {
    if (part.inlineData) {
      const base64EncodeString: string = part.inlineData.data;
      return `data:image/png;base64,${base64EncodeString}`;
    }
  }

  throw new Error("Failed to render the meme template visual.");
};
