
import { GoogleGenAI, Type } from "@google/genai";

// Vercel Serverless Function Handler
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, style } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Step 1: Generate Meme Config (Caption and Image Prompt)
    const configResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a viral meme architect. Generate a meme concept for the following topic: "${prompt}". 
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
            caption: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
          },
          required: ["caption", "imagePrompt"],
        },
      },
    });

    const memeConfig = JSON.parse(configResponse.text);

    // Step 2: Generate the Meme Template Image
    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `A professional meme template, expressive, cinematic lighting, high-quality, NO TEXT in image: ${memeConfig.imagePrompt}`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      },
    });

    const candidate = imageResponse.candidates?.[0];
    let imageUrl = '';

    if (candidate) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      throw new Error("Failed to generate meme image");
    }

    // Return combined data to frontend
    return res.status(200).json({
      imageUrl,
      caption: memeConfig.caption,
      refinedPrompt: memeConfig.imagePrompt,
      style: style
    });

  } catch (error: any) {
    console.error('Gemini Backend Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error during generation' });
  }
}
