import React from 'react';
import { GenerationProgress, Character, Scene } from '../types';

interface AssetGeneratorProps {
  progress: GenerationProgress;
  characters: Character[];
  scenes: Scene[];
  onPlay: () => void;
}

export const AssetGenerator: React.FC<AssetGeneratorProps> = ({ progress, characters, scenes, onPlay }) => {
  const percentage = Math.round((progress.current / progress.total) * 100) || 0;
  const isComplete = progress.current === progress.total && progress.total > 0;

  return (
    <div className="flex flex-col h-full items-center justify-center max-w-4xl mx-auto p-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Bringing Your World to Life</h2>
        <p className="text-slate-500">{progress.status}</p>
      </div>

      {/* Progress Circle */}
      <div className="relative w-48 h-48 mb-12">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="12"
          />
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="#4f46e5"
            strokeWidth="12"
            strokeDasharray={553}
            strokeDashoffset={553 - (553 * percentage) / 100}
            className="transition-all duration-500 ease-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-4xl font-bold text-indigo-600">{percentage}%</span>
          <span className="text-xs text-slate-400 uppercase tracking-wide mt-1">Completed</span>
        </div>
      </div>

      {/* Preview Grid */}
      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-h-60 overflow-y-auto p-2 scrollbar-thin">
        {scenes.map((scene) => (
          <div key={scene.id} className="aspect-video rounded-lg overflow-hidden shadow-md bg-slate-100 relative group">
            <img src={scene.image} alt="Scene" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-white text-xs font-semibold px-2 text-center">{scene.id}</span>
            </div>
          </div>
        ))}
        {characters.map((char) => (
          Object.values(char.visuals).map((src, idx) => (
            <div key={`${char.name}-${idx}`} className="aspect-[3/4] rounded-lg overflow-hidden shadow-md bg-white border border-slate-100 relative group">
              <img src={src} alt={char.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-semibold">{char.name}</span>
              </div>
            </div>
          ))
        ))}
      </div>

      <button
        onClick={onPlay}
        disabled={!isComplete}
        className={`
          px-10 py-4 rounded-full font-bold text-lg shadow-xl
          transition-all duration-300 flex items-center gap-3
          ${!isComplete 
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:scale-110 hover:shadow-indigo-500/25'}
        `}
      >
        {!isComplete ? 'Generating Assets...' : 'Start Game'}
        {isComplete && (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        )}
      </button>

    </div>
  );
};
