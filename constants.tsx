
import React from 'react';
import { Sparkles, Laugh, Heart, Zap, Ghost, Skull } from 'lucide-react';
import { MemeStyle } from './types';

export const APP_NAME = "Prompt2Meme";
export const TAGLINE = "The minimalist AI meme engine.";

export const STYLE_CONFIG = {
  [MemeStyle.SARCASTIC]: { icon: <Laugh className="w-4 h-4" />, color: "bg-white text-gray-700 border-gray-100" },
  [MemeStyle.SAVAGE]: { icon: <Sparkles className="w-4 h-4" />, color: "bg-white text-gray-700 border-gray-100" },
  [MemeStyle.WHOLESOME]: { icon: <Heart className="w-4 h-4" />, color: "bg-white text-gray-700 border-gray-100" },
  [MemeStyle.DARK_HUMOR]: { icon: <Skull className="w-4 h-4" />, color: "bg-white text-gray-700 border-gray-100" },
  [MemeStyle.GEN_Z]: { icon: <Zap className="w-4 h-4" />, color: "bg-white text-gray-700 border-gray-100" },
  [MemeStyle.SURREAL]: { icon: <Ghost className="w-4 h-4" />, color: "bg-white text-gray-700 border-gray-100" },
};

export const PLACEHOLDERS = [
  "Explain technical debt like I'm five",
  "The coffee machine broke at the office",
  "Me trying to exit Vim for the first time",
  "When the meeting could have been an email",
  "Deploying on a Friday at 4:55 PM",
  "When the senior dev looks at my PR",
  "Trying to find the semicolon in 500 lines of code"
];
