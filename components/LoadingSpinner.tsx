
import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "Understanding context...",
  "Refining the humor...",
  "Generating template...",
  "Applying punchline...",
  "Almost there..."
];

const LoadingSpinner: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full space-y-8 flex flex-col items-center py-12">
      <div className="w-full max-w-lg aspect-square bg-gray-100/50 rounded-[2rem] animate-pulse flex items-center justify-center border border-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
          <p className="text-gray-400 font-medium text-sm font-outfit uppercase tracking-widest">Generating Visuals</p>
        </div>
      </div>
      <div className="text-center">
        <p className="text-gray-400 font-medium animate-pulse transition-all duration-500">
          {MESSAGES[msgIndex]}
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
