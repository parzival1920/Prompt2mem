
import { MemeStyle, MemeData } from "../types";

/**
 * Frontend service that communicates with our secure Vercel backend.
 */
export const generateMeme = async (prompt: string, style: MemeStyle): Promise<MemeData> => {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, style }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate meme via backend');
  }

  return await response.json();
};
