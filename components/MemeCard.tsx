
import React, { useRef } from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { MemeData } from '../types';

interface MemeCardProps {
  meme: MemeData;
  onRegenerate: () => void;
}

const MemeCard: React.FC<MemeCardProps> = ({ meme, onRegenerate }) => {
  const memeRef = useRef<HTMLDivElement>(null);

  const downloadMeme = async () => {
    if (!memeRef.current) return;

    const canvas = document.createElement('canvas');
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = meme.imageUrl;

    img.onload = () => {
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw Image
      ctx.drawImage(img, 0, 0, 1024, 1024);

      // Draw Text
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 10;
      ctx.textAlign = 'center';
      ctx.font = 'bold 72px Impact, "Arial Black", sans-serif';

      const words = meme.caption.toUpperCase().split(' ');
      const lines: string[] = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + " " + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 900) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);

      const lineHeight = 80;
      const totalHeight = lines.length * lineHeight;
      const startY = 950 - totalHeight;

      lines.forEach((line, index) => {
        const y = startY + (index * lineHeight);
        ctx.strokeText(line, 512, y);
        ctx.fillText(line, 512, y);
      });

      const link = document.createElement('a');
      link.download = `meme-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  return (
    <div className="w-full animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl transition-all">
        {/* Template Image Section */}
        <div ref={memeRef} className="relative aspect-square bg-gray-50 overflow-hidden group">
          <img 
            src={meme.imageUrl} 
            alt="Generated Meme Template" 
            className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
            <h2 className="meme-text text-white text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight select-none">
              {meme.caption}
            </h2>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-6 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Vibe</span>
            <span className="text-sm font-semibold text-gray-700">{meme.style}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRegenerate}
              className="p-3 bg-gray-50 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-all"
              title="Regenerate"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={downloadMeme}
              className="px-6 py-3 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeCard;
