
import { GoogleGenAI, Type } from "@google/genai";
import { MemeStyle, GeminiMemeConfig } from "../types";

export const generateMemeConfig = async (userPrompt: string, style: MemeStyle): Promise<GeminiMemeConfig> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `The user wants to create a meme. 
    Topic: "${userPrompt}"
    Style: ${style}
    
    Generate two things:
    1. A refined image prompt for an AI image generator. The image should be a "meme template" style (high quality, expressive, funny, but WITHOUT text).
    2. A witty, short, punchy meme caption (max 15 words).
    
    The response should be strictly valid JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          caption: {
            type: Type.STRING,
            description: "The humorous caption to overlay on the meme.",
          },
          imagePrompt: {
            type: Type.STRING,
            description: "The visual description for generating the meme template.",
          },
        },
        required: ["caption", "imagePrompt"],
      },
    },
  });

  const config = JSON.parse(response.text);
  return config;
};

export const generateMemeImage = async (imagePrompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `A high-quality, expressive meme template without any text. Highly detailed and cinematic. Subject: ${imagePrompt}`,
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
  if (!candidate) throw new Error("No response from image model");

  for (const part of candidate.content.parts) {
    if (part.inlineData) {
      const base64EncodeString: string = part.inlineData.data;
      return `data:image/png;base64,${base64EncodeString}`;
    }
  }

  throw new Error("Failed to extract image from model response.");
};
