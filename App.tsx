
import React, { useState, useEffect, useRef } from 'react';
import { Layout, AlertCircle, ArrowRight, RotateCcw, Lightbulb, Key } from 'lucide-react';
import { MemeStyle, MemeData } from './types';
import { APP_NAME, STYLE_CONFIG, PLACEHOLDERS } from './constants';
import { generateMemeConfig, generateMemeImage } from './services/geminiService';
import LoadingSpinner from './components/LoadingSpinner';
import MemeCard from './components/MemeCard';

// Fix: Define AIStudio interface to match existing global definitions and avoid type mismatch errors.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<MemeStyle>(MemeStyle.SARCASTIC);
  const [isGenerating, setIsGenerating] = useState(false);
  const [memeData, setMemeData] = useState<MemeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [randomPlaceholder, setRandomPlaceholder] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [hasKey, setHasKey] = useState<boolean>(true);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();

    const shuffled = [...PLACEHOLDERS].sort(() => 0.5 - Math.random());
    setRandomPlaceholder(shuffled[0]);
    setSuggestions(shuffled.slice(1, 5));
  }, []);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // As per guidelines, assume success after triggering the selection to avoid race conditions.
      setHasKey(true);
      setError(null);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setMemeData(null);

    try {
      const config = await generateMemeConfig(prompt, selectedStyle);
      const imageUrl = await generateMemeImage(config.imagePrompt);
      
      setMemeData({
        imageUrl,
        caption: config.caption,
        refinedPrompt: config.imagePrompt,
        style: selectedStyle
      });
      
    } catch (err: any) {
      const msg = err.message || "";
      // Handle the specific error message as required by the Veo/Imagen guidelines.
      if (msg.includes("Requested entity was not found") || msg.includes("API key")) {
        setHasKey(false);
        setError("API Key issue detected. Please re-configure your key.");
      } else {
        setError(err.message || "Failed to generate meme. Please try again.");
      }
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const applySuggestion = (text: string) => {
    setPrompt(text);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col items-center selection:bg-black selection:text-white transition-all duration-500 font-outfit">
      {/* Navigation */}
      <nav className="w-full max-w-6xl px-6 py-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.location.reload()}>
          <div className="bg-black p-1.5 rounded-lg">
            <Layout className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
        </div>
        <div className="flex items-center gap-4">
          {!hasKey && (
            <button 
              onClick={handleOpenKeySelector}
              className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse border border-amber-200"
            >
              <Key className="w-3 h-3" />
              Setup API Key
            </button>
          )}
          <span className="hidden md:inline-block text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-widest">v2.3 Stable</span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="w-full max-w-2xl px-6 pb-32 flex flex-col flex-grow">
        
        <div className="flex-grow flex flex-col justify-end">
          {!memeData && !isGenerating && !error && (
            <div className="mb-12 py-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-5xl font-bold tracking-tight mb-4">
                Internet culture, <span className="text-gray-400">instantly</span>.
              </h1>
              <p className="text-lg text-gray-500 max-w-md mx-auto">
                Turn your funniest ideas into viral-ready templates with AI.
              </p>
            </div>
          )}

          {isGenerating && (
            <div className="mb-8 animate-in fade-in duration-500">
              <LoadingSpinner />
            </div>
          )}

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex flex-col gap-2 text-red-600 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-bold">Generation Error</p>
              </div>
              <p className="text-xs ml-8">{error}</p>
              {!hasKey && (
                <button 
                  onClick={handleOpenKeySelector}
                  className="ml-8 mt-2 w-fit px-4 py-2 bg-red-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest"
                >
                  Configure Key Now
                </button>
              )}
            </div>
          )}

          {memeData && !isGenerating && (
            <div className="mb-8">
              <MemeCard meme={memeData} onRegenerate={handleGenerate} />
            </div>
          )}
        </div>

        {/* INPUT AREA */}
        <div className="sticky bottom-10 w-full z-40 space-y-4">
          {!isGenerating && !memeData && (
            <div className="flex flex-wrap gap-2 justify-center animate-in fade-in duration-1000 slide-in-from-bottom-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
                <Lightbulb className="w-3 h-3" />
                Try these:
              </div>
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => applySuggestion(s)}
                  className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full hover:border-black hover:bg-gray-50 transition-all text-gray-600 font-medium shadow-sm"
                >
                  {s.length > 30 ? s.slice(0, 30) + '...' : s}
                </button>
              ))}
            </div>
          )}

          <div className="bg-white rounded-[2rem] border border-gray-200 shadow-xl focus-within:shadow-2xl focus-within:border-gray-400 transition-all p-3 pl-5 pr-5 flex flex-col gap-2">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={randomPlaceholder}
              disabled={isGenerating || !hasKey}
              className={`w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-3 text-lg resize-none min-h-[60px] max-h-[200px] placeholder:text-gray-300 font-medium font-inter ${!hasKey ? 'cursor-not-allowed opacity-50' : ''}`}
              rows={1}
            />
            
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {Object.keys(STYLE_CONFIG).map((style) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style as MemeStyle)}
                    className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      selectedStyle === style 
                      ? 'bg-black text-white border-black' 
                      : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'
                    }`}
                  >
                    {STYLE_CONFIG[style as MemeStyle].icon}
                    {style}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim() || !hasKey}
                className={`p-2.5 rounded-full transition-all flex items-center justify-center ${
                  isGenerating || !prompt.trim() || !hasKey
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-black text-white hover:scale-105 active:scale-95 shadow-md'
                }`}
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          
          {memeData && !isGenerating && (
            <div className="flex justify-center animate-in fade-in duration-500">
               <button 
                onClick={() => { setMemeData(null); setPrompt(''); }}
                className="px-4 py-2 bg-gray-100 hover:bg-black hover:text-white rounded-full text-xs font-bold uppercase tracking-widest text-gray-500 transition-all flex items-center gap-2 shadow-sm"
              >
                <RotateCcw className="w-3 h-3" />
                Clear and Restart
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-gray-300 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-4">
        <span>Gemini Powered &bull; {new Date().getFullYear()}</span>
        <button onClick={handleOpenKeySelector} className="hover:text-black transition-colors underline decoration-dotted">Update Key</button>
      </footer>
    </div>
  );
};

export default App;
