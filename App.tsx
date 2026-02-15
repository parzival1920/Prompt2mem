
import React, { useState, useEffect, useRef } from 'react';
import { Layout, AlertCircle, ArrowRight, RotateCcw, Lightbulb } from 'lucide-react';
import { MemeStyle, MemeData } from './types';
import { APP_NAME, STYLE_CONFIG, PLACEHOLDERS } from './constants';
import { generateMeme } from './services/geminiService';
import LoadingSpinner from './components/LoadingSpinner';
import MemeCard from './components/MemeCard';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<MemeStyle>(MemeStyle.SARCASTIC);
  const [isGenerating, setIsGenerating] = useState(false);
  const [memeData, setMemeData] = useState<MemeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [randomPlaceholder, setRandomPlaceholder] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const shuffled = [...PLACEHOLDERS].sort(() => 0.5 - Math.random());
    setRandomPlaceholder(shuffled[0]);
    setSuggestions(shuffled.slice(1, 5));
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setMemeData(null);

    try {
      // Calling the unified secure backend endpoint
      const result = await generateMeme(prompt, selectedStyle);
      setMemeData(result);
      
    } catch (err: any) {
      console.error('Generation failure:', err);
      setError(err.message || "Something went wrong. Please check your connection or try again later.");
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

  const resetSession = () => {
    setMemeData(null);
    setPrompt('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col items-center selection:bg-black selection:text-white transition-all duration-500 font-outfit">
      {/* Navigation */}
      <nav className="w-full max-w-6xl px-6 py-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.location.reload()}>
          <div className="bg-black p-1.5 rounded-lg transition-transform group-hover:rotate-12">
            <Layout className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline-block text-xs font-bold text-green-500 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest border border-green-100">Secure Backend Active</span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="w-full max-w-2xl px-6 pb-32 flex flex-col flex-grow">
        
        <div className="flex-grow flex flex-col justify-end">
          {!memeData && !isGenerating && !error && (
            <div className="mb-12 py-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-5xl font-bold tracking-tight mb-4">
                Internet culture, <span className="text-gray-400 italic">instantly</span>.
              </h1>
              <p className="text-lg text-gray-500 max-w-md mx-auto">
                Turn your funniest ideas into viral-ready templates with secure high-fidelity AI.
              </p>
            </div>
          )}

          {isGenerating && (
            <div className="mb-8 animate-in fade-in duration-500">
              <LoadingSpinner />
            </div>
          )}

          {error && (
            <div className="mb-8 p-6 bg-white border border-red-100 rounded-3xl flex flex-col gap-3 text-red-600 shadow-sm animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <p className="text-base font-bold">Generation Error</p>
              </div>
              <p className="text-sm opacity-80 leading-relaxed">{error}</p>
              <button 
                onClick={handleGenerate}
                className="mt-2 w-fit px-6 py-2 bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
              >
                Retry Generation
              </button>
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
                  className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full hover:border-black hover:bg-gray-50 transition-all text-gray-600 font-medium shadow-sm active:scale-95"
                >
                  {s.length > 30 ? s.slice(0, 30) + '...' : s}
                </button>
              ))}
            </div>
          )}

          <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-2xl focus-within:border-gray-400 transition-all p-4 pl-6 pr-6 flex flex-col gap-2">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={randomPlaceholder}
              disabled={isGenerating}
              className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-3 text-lg resize-none min-h-[60px] max-h-[200px] placeholder:text-gray-300 font-medium font-inter"
              rows={1}
            />
            
            <div className="flex items-center justify-between pb-1 pt-2 border-t border-gray-50">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {Object.keys(STYLE_CONFIG).map((style) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style as MemeStyle)}
                    className={`text-[10px] uppercase tracking-wider font-bold px-4 py-2 rounded-full border transition-all whitespace-nowrap flex items-center gap-2 ${
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
                disabled={isGenerating || !prompt.trim()}
                className={`p-3 rounded-full transition-all flex items-center justify-center ${
                  isGenerating || !prompt.trim()
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-black text-white hover:scale-105 active:scale-95 shadow-lg'
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
                onClick={resetSession}
                className="px-6 py-2.5 bg-white border border-gray-200 hover:border-black hover:bg-black hover:text-white rounded-full text-xs font-bold uppercase tracking-widest text-gray-500 transition-all flex items-center gap-2 shadow-md"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Start Over
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 text-gray-300 text-[10px] font-bold uppercase tracking-[0.4em]">
        Server-side Security Enabled &bull; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
