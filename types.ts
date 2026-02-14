
export enum MemeStyle {
  SARCASTIC = 'Sarcastic',
  SAVAGE = 'Savage',
  WHOLESOME = 'Wholesome',
  DARK_HUMOR = 'Dark Humor',
  GEN_Z = 'Gen Z',
  SURREAL = 'Surreal'
}

export interface MemeData {
  imageUrl: string;
  caption: string;
  refinedPrompt: string;
  style: MemeStyle;
}

export interface GeminiMemeConfig {
  caption: string;
  imagePrompt: string;
}
